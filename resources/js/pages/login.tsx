import { router } from "@inertiajs/react";

export default function Index() {
    return (
        <div className="flex justify-center items-center min-h-screen">
            <button
                onClick={() => router.post("/login")}
                className="bg-[#1877F2] flex items-center gap-3 pr-5 px-4 py-3 rounded-lg font-bold text-white cursor-pointer"
            >
                <i className="text-lg fa-brands fa-facebook fa-fw" />
                <span>Continue with Facebook</span>
            </button>
        </div>
    );
}
