"use client";

import { Header } from "@/components/header";

import { Content } from "@/components/content";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col px-6">
      <Header />

      <Content />
    </div>
  );
}
