export default function TransitionNoteCard({
  fromSongIndex,
  toSongIndex,
  content,
  onChange,
}: {
  fromSongIndex: number;
  toSongIndex: number;
  content: string;
  onChange: (content: string) => void;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <label className="block text-sm font-medium text-white/90 mb-2">
        Transition Notes (between Song {fromSongIndex} and Song {toSongIndex})
      </label>
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/50 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20"
        placeholder="Add specific notes about how you want the transition between these songs..."
        rows={2}
      />
    </div>
  );
}
