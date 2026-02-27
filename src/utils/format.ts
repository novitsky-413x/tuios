export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  
  const units = ["B", "KB", "MB", "GB", "TB"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = bytes / Math.pow(k, i);
  
  return `${size.toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}

export function formatDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return date.toLocaleTimeString(undefined, { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  } else if (diffDays < 7) {
    return date.toLocaleDateString(undefined, { 
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  } else if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString(undefined, { 
      month: "short", 
      day: "numeric" 
    });
  } else {
    return date.toLocaleDateString(undefined, { 
      year: "numeric",
      month: "short", 
      day: "numeric" 
    });
  }
}

export function formatPermissions(mode: number): string {
  const perms = [
    (mode & 0o400) ? "r" : "-",
    (mode & 0o200) ? "w" : "-",
    (mode & 0o100) ? "x" : "-",
    (mode & 0o040) ? "r" : "-",
    (mode & 0o020) ? "w" : "-",
    (mode & 0o010) ? "x" : "-",
    (mode & 0o004) ? "r" : "-",
    (mode & 0o002) ? "w" : "-",
    (mode & 0o001) ? "x" : "-",
  ];
  return perms.join("");
}

export function truncatePath(path: string, maxLength: number): string {
  if (path.length <= maxLength) return path;
  
  const parts = path.split("/").filter(Boolean);
  if (parts.length <= 2) {
    return "..." + path.slice(-(maxLength - 3));
  }
  
  const first = parts[0];
  const last = parts[parts.length - 1];
  
  if (first && last && first.length + last.length + 5 <= maxLength) {
    return `/${first}/.../${last}`;
  }
  
  return "..." + path.slice(-(maxLength - 3));
}

export function padRight(str: string, length: number): string {
  if (str.length >= length) return str.slice(0, length);
  return str + " ".repeat(length - str.length);
}

export function padLeft(str: string, length: number): string {
  if (str.length >= length) return str.slice(0, length);
  return " ".repeat(length - str.length) + str;
}
