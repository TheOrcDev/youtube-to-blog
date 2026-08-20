"use client";

import { Check, Copy, Loader2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { API_MAX_KEYS_PER_USER } from "@/lib/entitlements/policy";

interface ApiKeyRow {
  createdAt: Date;
  id: string;
  lastRequest: Date | null;
  name: string | null;
  start: string | null;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ApiKeysCard() {
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loadKeys = useCallback(async () => {
    const { data } = await authClient.apiKey.list();

    setKeys(data ?? []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadKeys();
  }, [loadKeys]);

  async function createKey() {
    const name = newKeyName.trim();

    if (!name) {
      toast.error("Give the key a name so you can recognize it later.");
      return;
    }

    if (keys.length >= API_MAX_KEYS_PER_USER) {
      toast.error(
        `You can have at most ${API_MAX_KEYS_PER_USER} API keys. Revoke one first.`
      );
      return;
    }

    setIsCreating(true);

    try {
      const { data, error } = await authClient.apiKey.create({ name });

      if (error || !data) {
        toast.error(error?.message || "Could not create the API key.");
        return;
      }

      setCreatedKey(data.key);
      setCopied(false);
      setNewKeyName("");
      await loadKeys();
    } finally {
      setIsCreating(false);
    }
  }

  async function revokeKey(keyId: string) {
    const { error } = await authClient.apiKey.delete({ keyId });

    if (error) {
      toast.error(error.message || "Could not revoke the API key.");
      return;
    }

    toast.success("API key revoked.");
    await loadKeys();
  }

  function copyCreatedKey() {
    if (!createdKey) {
      return;
    }

    navigator.clipboard.writeText(createdKey);
    setCopied(true);
    toast.success("API key copied to clipboard.");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>API keys</CardTitle>
        <CardDescription>
          Generate blog posts programmatically. Keys are shown once at creation.
          See the{" "}
          <Link className="underline underline-offset-4" href="/docs/api">
            API documentation
          </Link>{" "}
          for usage.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex gap-2">
          <Input
            aria-label="New API key name"
            disabled={isCreating}
            onChange={(event) => setNewKeyName(event.target.value)}
            placeholder="Key name (e.g. CI pipeline)"
            value={newKeyName}
          />
          <Button disabled={isCreating} onClick={createKey} type="button">
            {isCreating ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Plus data-icon="inline-start" />
            )}
            Create key
          </Button>
        </div>

        {createdKey ? (
          <div className="flex flex-col gap-2 rounded-md border border-primary/50 bg-muted/50 p-3">
            <p className="font-medium text-sm">
              Copy your new key now — it will not be shown again.
            </p>
            <div className="flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded bg-background px-2 py-1.5 font-mono text-xs">
                {createdKey}
              </code>
              <Button
                aria-label="Copy API key"
                onClick={copyCreatedKey}
                size="icon"
                type="button"
                variant="outline"
              >
                {copied ? <Check /> : <Copy />}
              </Button>
            </div>
          </div>
        ) : null}

        {isLoading ? (
          <p className="text-muted-foreground text-sm">Loading keys…</p>
        ) : null}

        {!isLoading && keys.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No API keys yet. Create one to call the API.
          </p>
        ) : null}

        {keys.map((key) => (
          <div
            className="flex items-center gap-3 rounded-md border px-3 py-2"
            key={key.id}
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-sm">
                {key.name || "Unnamed key"}
              </p>
              <p className="text-muted-foreground text-xs">
                <code className="font-mono">{key.start ?? "ytb_"}…</code>
                {" · Created "}
                {formatDate(key.createdAt)}
                {key.lastRequest
                  ? ` · Last used ${formatDate(key.lastRequest)}`
                  : " · Never used"}
              </p>
            </div>
            <Badge variant="secondary">Active</Badge>
            <Button
              aria-label={`Revoke key ${key.name || key.id}`}
              onClick={() => revokeKey(key.id)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <Trash2 />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
