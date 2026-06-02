import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-appbg p-6">
      <div className="rounded-2xl border border-borderline bg-white p-8 text-center shadow-soft">
        <h1 className="text-3xl font-bold text-navy">Page not found</h1>
        <p className="mt-2 text-textsecondary">The page you are looking for does not exist.</p>
        <Link to="/" className="mt-4 inline-block rounded-xl bg-royal px-5 py-3 font-semibold text-white">Go Home</Link>
      </div>
    </main>
  );
};

export default NotFound;
