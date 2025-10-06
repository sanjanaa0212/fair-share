"use client";

import type React from "react";

import { useId, useState } from "react";
import { parseCSV } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

export function CsvUploader({
  onParsed,
  templateHint,
}: {
  onParsed: (rows: string[][]) => void;
  templateHint: string;
}) {
  const id = useId();
  const [rows, setRows] = useState<string[][]>([]);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = parseCSV(text);
      setRows(parsed);
      setError(null);
      onParsed(parsed);
    } catch (err: any) {
      setError(err?.message || "Could not parse CSV");
    }
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-3">
        <div className="text-sm text-muted-foreground">CSV format: {templateHint}</div>
        <div className="flex items-center gap-2">
          <Input id={id} type="file" accept=".csv,text/csv" onChange={handleFile} />
          <Button
            variant="outline"
            onClick={() => {
              const blob = new Blob([templateHint + "\n"], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "template.csv";
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Download template
          </Button>
        </div>
        {error ? <div className="text-sm text-destructive">{error}</div> : null}
        {rows.length > 0 && (
          <div className="overflow-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  {rows?.[0].map((h, i) => (
                    <TableHead key={i}>{h || "—"}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.slice(1, 11).map((r, ri) => (
                  <TableRow key={ri}>
                    {r.map((c, ci) => (
                      <TableCell key={ci}>{c || "—"}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
