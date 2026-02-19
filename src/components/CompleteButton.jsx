export default function CompleteButton({ onChange }) {
    return (
        <button
            className="w-full h-12 bg-[#583FE7] text-white font-bold rounded-2xl"
            onClick={onChange}
        >
            완료
        </button>
    )
}
