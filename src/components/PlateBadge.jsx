export default function PlateBadge({ placa }) {
  if (!placa) return null
  return (
    <div className="inline-flex items-center rounded-plate border-2 border-navy-900 bg-gradient-to-b from-yellow-300 to-yellow-400 px-3 py-1 shadow-sm">
      <span className="font-mono font-bold tracking-widest text-navy-900 text-lg">
        {placa}
      </span>
    </div>
  )
}
