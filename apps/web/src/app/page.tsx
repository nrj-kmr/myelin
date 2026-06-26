import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Footer } from "@/components/Footer";

export default function LandingPage() {
  return (
    <div className="relative bg-background selection:bg-primary/30 min-h-screen font-sans text-foreground selection:text-foreground transition-colors duration-300">
      
      {/* Background Blobs Container (clips overflow to prevent empty scrolling/vertical space below footer) */}
      {/* <div className="z-0 absolute inset-0 overflow-hidden pointer-events-none">
        <div className="top-[-10%] left-[-10%] absolute bg-primary/5 dark:bg-primary/10 blur-[120px] rounded-full w-[50%] h-[50%] animate-pulse-slow" />
        <div className="top-[20%] right-[-10%] absolute bg-secondary/5 dark:bg-secondary/10 blur-[150px] rounded-full w-[60%] h-[60%] animate-pulse-slow" />
        <div className="bottom-[-10%] left-[20%] absolute bg-primary/5 dark:bg-primary/5 blur-[120px] rounded-full w-[50%] h-[50%] animate-pulse-slow" />
      </div> */}

      <Header />
      <main className="relative flex flex-col gap-4">
        <Hero />
        <Features />
      </main>
      <Footer />
      
    </div>
  );
}
