// Log parser for CodeBuddy logs

import {
  LogEntry,
  ParsedLog,
  ParsedLogEntry,
  SystemInitEntry,
  FileHistoryEntry,
  AssistantEntry,
  UserEntry,
  ResultEntry,
} from './types';

// Regex to match log line format: TIMESTAMP JSON (CodeBuddy format)
const LOG_LINE_REGEX = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z)\s+(.+)$/;

// Regex to match GitHub Actions log format: TIMESTAMPZ LOG_CONTENT
const GHA_LOG_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z\s+(.+)$/;

// Regex to detect JSON object start
const JSON_START_REGEX = /^\s*\{/;

export function parseLogLine(line: string, silent: boolean = false): ParsedLogEntry | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  let jsonStr: string;
  let rawTimestamp: string | undefined;

  // Try CodeBuddy format first: TIMESTAMP JSON
  let match = trimmed.match(LOG_LINE_REGEX);
  if (match) {
    [, rawTimestamp, jsonStr] = match;
  } else if (JSON_START_REGEX.test(trimmed)) {
    // Pure JSON without timestamp prefix
    jsonStr = trimmed;
    rawTimestamp = undefined;
  } else {
    // Try GitHub Actions format: TIMESTAMPZ JSON
    match = trimmed.match(GHA_LOG_REGEX);
    if (match) {
      jsonStr = match[1];
      rawTimestamp = undefined;
    } else {
      if (!silent) {
        // Skip non-JSON lines silently in stream mode
      }
      return null;
    }
  }

  let json: Record<string, unknown>;
  try {
    json = JSON.parse(jsonStr);
  } catch (e) {
    if (!silent) {
      // Invalid JSON, skip
    }
    return null;
  }

  // Validate it's a CodeBuddy log entry
  if (!json.type || typeof json.type !== 'string') {
    return null;
  }

  // Use __timestamp from JSON if available, otherwise use extracted timestamp or current time
  const timestamp = json.__timestamp as string || rawTimestamp || new Date().toISOString();

  const baseEntry: LogEntry = {
    timestamp: formatTimestamp(timestamp),
    rawTimestamp: timestamp,
    type: json.type as string,
    subtype: json.subtype as string | undefined,
    uuid: json.uuid as string,
    session_id: json.session_id as string,
    ...json,
  };

  return parseTypedEntry(baseEntry, json);
}

function parseTypedEntry(base: LogEntry, json: Record<string, unknown>): ParsedLogEntry {
  // Map the JSON timestamp to snapshotTimestamp for file-history-snapshot
  if (base.type === 'file-history-snapshot') {
    (base as FileHistoryEntry).snapshotTimestamp = json.timestamp as number;
  }
  
  switch (base.type) {
    case 'system':
      return base as SystemInitEntry;
    case 'file-history-snapshot':
      return base as FileHistoryEntry;
    case 'assistant':
      return base as AssistantEntry;
    case 'user':
      return base as UserEntry;
    case 'result':
      return base as ResultEntry;
    default:
      return base as ParsedLogEntry;
  }
}

function formatTimestamp(isoTimestamp: string): string {
  // Convert ISO timestamp to local time format
  try {
    const date = new Date(isoTimestamp);
    return date.toLocaleString('zh-CN', {
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return isoTimestamp;
  }
}

export function parseLogFile(content: string): ParsedLog {
  const lines = content.split('\n');
  const entries: ParsedLogEntry[] = [];
  let sessionInfo: ParsedLog['sessionInfo'];
  let result: ResultEntry | undefined;

  for (const line of lines) {
    // Use silent mode for batch parsing
    const entry = parseLogLine(line, true);
    if (!entry) continue;

    entries.push(entry);

    // Extract session info from init entry
    if (entry.type === 'system' && entry.subtype === 'init') {
      const initEntry = entry as SystemInitEntry;
      sessionInfo = {
        sessionId: initEntry.session_id,
        model: initEntry.model,
        cwd: initEntry.cwd,
        startTime: entry.timestamp,
      };
    }

    // Capture result entry
    if (entry.type === 'result') {
      result = entry as ResultEntry;
    }
  }

  return { entries, sessionInfo, result };
}
