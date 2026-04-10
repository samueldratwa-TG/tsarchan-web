export function HeroSection() {
  return (
    <section className="py-16 md:py-24 text-center">
      <div className="mx-auto max-w-[1200px] px-6">
        <h1
          className="text-4xl md:text-5xl lg:text-6xl font-black text-text-primary mb-4 animate-fade-up"
          style={{ animationDelay: "0ms" }}
        >
          הצרחן הנבון
        </h1>
        <p
          className="text-lg md:text-xl text-text-secondary mb-6 animate-fade-up"
          style={{ animationDelay: "80ms" }}
        >
          כלים חכמים אך פשוטים לחיי יומיום
        </p>
        <div
          className="mx-auto h-1 w-20 rounded-full bg-gradient-to-l from-accent to-accent-warm animate-fade-up"
          style={{ animationDelay: "160ms" }}
        />
      </div>
    </section>
  );
}
