import { useState, useEffect } from "react";

export function DecryptText({ text }: { text: string }) {
  const [display, setDisplay] = useState("");
  const chars = "X01_@#*&"; // Menos caracteres deixa o efeito mais limpo

  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplay(text
        .split("")
        .map((letter, index) => {
          if (index < iteration) return text[index];
          if (letter === " ") return " ";
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join("")
      );

      if (iteration >= text.length) clearInterval(interval);
      iteration += text.length / 30; // Termina em exatamente 30 frames (~0.5s)
    }, 25);

    return () => clearInterval(interval);
  }, [text]);

  return <span className="font-mono">{display}</span>;
}