import React from "react";


export function FileInput({id,accept,onFileSelected,className,}: {id?: string;accept?: string;onFileSelected: (file: File | null) => void;className?: string;}) {
    return (
        <div className={className}>
        <input
        id={id}
        type="file"
        accept={accept}
        onChange={(e) => {
        const f = e.target.files && e.target.files[0] ? e.target.files[0] : null;
        onFileSelected(f);
    }}
        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-100 hover:file:bg-slate-200"
        />
        </div>
        );
}