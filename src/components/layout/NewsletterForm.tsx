"use client";

export default function NewsletterForm() {
  return (
    <form className="flex mt-2" onSubmit={(e) => e.preventDefault()}>
      <input type="email" placeholder="seu@email.com" className="flex-1 px-3 py-2.5 rounded-l-md text-[0.8rem] text-support" />
      <button type="submit" className="px-3.5 py-2.5 rounded-r-md bg-primary text-white font-bold hover:bg-primary-dark">OK</button>
    </form>
  );
}
