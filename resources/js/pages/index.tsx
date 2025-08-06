import { useAuth } from "@/lib/hooks/useAuth";

export default function Index() {
    const user = useAuth();

    return (
        <div>
            <div className="bg-blue-50">logged in</div>
            <div className="bg-pink-50">{JSON.stringify(user)}</div>
        </div>
    );
}
