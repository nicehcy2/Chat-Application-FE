export default function CompleteButton({ label, onChange }) {
    return (
        <button
            className="w-full h-12 bg-primary text-white font-bold rounded-2xl"
            onClick={onChange}
        >
            {label}
        </button>
    )
}
