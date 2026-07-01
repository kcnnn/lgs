export default function FlightGuidePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold">Flight guide</h1>
      <p className="mt-2 text-black/60">
        Follow this flight pattern to get photos our photogrammetry pipeline can turn into a clean
        orthomosaic and DSM.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Altitude</h2>
        <p className="mt-2 text-black/70">Placeholder copy — recommended flight altitude and GSD guidance.</p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Two-orbit pattern</h2>
        <p className="mt-2 text-black/70">
          Placeholder copy — fly one orbit at a 25° gimbal angle and a second orbit at 45°.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">80% overlap</h2>
        <p className="mt-2 text-black/70">Placeholder copy — maintain at least 80% image overlap between passes.</p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">~50 photos</h2>
        <p className="mt-2 text-black/70">Placeholder copy — aim for roughly 50 photos per roof.</p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Part 107 note</h2>
        <p className="mt-2 text-black/70">
          Placeholder copy — reminder that commercial drone flights require an FAA Part 107 certificate.
        </p>
      </section>
    </div>
  );
}
