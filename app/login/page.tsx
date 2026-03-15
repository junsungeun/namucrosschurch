"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push(redirect);
    } else {
      setError(true);
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#FAFAF8",
    }}>
      <div style={{ width: 360, padding: 40 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontFamily: '"GMarketSans", sans-serif', fontSize: 22, fontWeight: 700, color: "#3D6B4F", marginBottom: 8 }}>
            나무카드.
          </div>
          <p style={{ fontFamily: '"Suit", sans-serif', fontSize: 14, color: "#7A7A72" }}>
            비밀번호를 입력하세요
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="password"
            className="input"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          {error && (
            <p style={{ fontFamily: '"Suit", sans-serif', fontSize: 13, color: "#e05252", textAlign: "center" }}>
              비밀번호가 올바르지 않습니다
            </p>
          )}
          <button type="submit" className="btn btn-primary btn-lg" style={{ justifyContent: "center" }} disabled={loading}>
            {loading ? "확인 중..." : "입장하기"}
          </button>
        </form>

        <p style={{ marginTop: 32, fontFamily: '"Suit", sans-serif', fontSize: 12, color: "#aaa", textAlign: "center" }}>
          나무십자가교회 내부 도구
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
