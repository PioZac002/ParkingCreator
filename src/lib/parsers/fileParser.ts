export type ParsedUser = {
  name: string;
  email: string;
};

export type ParseResult = {
  users: ParsedUser[];
  errors: string[];
};

// Extract emails from plain text (one per line or comma-separated)
function parseTxt(text: string): ParseResult {
  const emailRegex = /[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+/g;
  const emails = text.match(emailRegex) ?? [];
  const users = emails.map((email) => ({
    email: email.trim().toLowerCase(),
    name: email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
  }));
  return {
    users,
    errors: users.length === 0 ? ["Nie znaleziono żadnych adresów email w pliku"] : [],
  };
}

function parseJson(text: string): ParseResult {
  try {
    const data = JSON.parse(text);
    if (!Array.isArray(data)) {
      return { users: [], errors: ["Plik JSON musi zawierać tablicę obiektów"] };
    }
    const users: ParsedUser[] = [];
    const errors: string[] = [];
    data.forEach((item, i) => {
      if (typeof item !== "object" || !item) {
        errors.push(`Wiersz ${i + 1}: nieprawidłowy format`);
        return;
      }
      const email = (item.email ?? item.Email ?? item.EMAIL ?? "").trim().toLowerCase();
      const name = (item.name ?? item.Name ?? item.NAME ?? item.imię ?? item.nazwisko ?? "").trim();
      if (!email) {
        errors.push(`Wiersz ${i + 1}: brak pola email`);
        return;
      }
      users.push({ email, name: name || email.split("@")[0] });
    });
    return { users, errors };
  } catch {
    return { users: [], errors: ["Nieprawidłowy format JSON"] };
  }
}

export async function parseFile(file: File): Promise<ParseResult & { columns?: string[]; rawRows?: Record<string, string>[] }> {
  const ext = file.name.split(".").pop()?.toLowerCase();

  if (ext === "json") {
    const text = await file.text();
    return parseJson(text);
  }

  if (ext === "txt") {
    const text = await file.text();
    return parseTxt(text);
  }

  if (ext === "csv") {
    const { default: Papa } = await import("papaparse");
    return new Promise((resolve) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const rows = results.data as Record<string, string>[];
          const columns = results.meta.fields ?? [];

          // Try auto-detect email and name columns
          const emailCol = columns.find((c) =>
            /email|e-mail|mail/i.test(c)
          );
          const nameCol = columns.find((c) =>
            /name|imię|nazwisko|imie|fullname|pełne|pelne/i.test(c)
          );

          if (emailCol) {
            const users = rows
              .filter((r) => r[emailCol]?.includes("@"))
              .map((r) => ({
                email: r[emailCol].trim().toLowerCase(),
                name: nameCol ? r[nameCol]?.trim() ?? "" : r[emailCol].split("@")[0],
              }));
            resolve({ users, errors: [], columns, rawRows: rows });
          } else {
            // Return raw for manual mapping
            resolve({ users: [], errors: [], columns, rawRows: rows });
          }
        },
        error: (err) => resolve({ users: [], errors: [err.message] }),
      });
    });
  }

  if (ext === "xlsx" || ext === "xls") {
    const XLSX = await import("xlsx");
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: "" });
    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

    const emailCol = columns.find((c) => /email|e-mail|mail/i.test(c));
    const nameCol = columns.find((c) => /name|imię|nazwisko|imie|fullname/i.test(c));

    if (emailCol) {
      const users = rows
        .filter((r) => String(r[emailCol]).includes("@"))
        .map((r) => ({
          email: String(r[emailCol]).trim().toLowerCase(),
          name: nameCol ? String(r[nameCol]).trim() : String(r[emailCol]).split("@")[0],
        }));
      return { users, errors: [], columns, rawRows: rows };
    }

    return { users: [], errors: [], columns, rawRows: rows };
  }

  return { users: [], errors: [`Nieobsługiwany format pliku: .${ext}`] };
}
