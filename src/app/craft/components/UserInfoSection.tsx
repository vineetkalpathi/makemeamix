export default function UserInfoSection({
  errors,
}: {
  errors?: Record<string, string>;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6">
      <h2 className="mb-6 text-xl font-bold">Your Information</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-white/90 mb-2"
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/50 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20"
            placeholder="Your name"
            required
          />
          {errors?.name && (
            <p className="mt-1 text-xs text-red-400">{errors.name}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-white/90 mb-2"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/50 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20"
            placeholder="your@email.com"
            required
          />
          {errors?.email && (
            <p className="mt-1 text-xs text-red-400">{errors.email}</p>
          )}
        </div>
      </div>

      <div className="mt-4">
        <label
          htmlFor="reason"
          className="block text-sm font-medium text-white/90 mb-2"
        >
          Reason for the Mix
        </label>
        <textarea
          id="reason"
          name="reason"
          className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/50 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20"
          placeholder="Tell us about the occasion - sangeet, wedding dance, just chilling, etc."
          rows={3}
          required
        />
        {errors?.reason && (
          <p className="mt-1 text-xs text-red-400">{errors.reason}</p>
        )}
      </div>
    </div>
  );
}
