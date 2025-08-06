import { useAuth } from "@/lib/hooks/useAuth";

export default function Index() {
    const foo = useAuth();

    return (
        <div>
            <div className="bg-blue-50">foo</div>
            <div className="bg-pink-50">{JSON.stringify(foo)}</div>
        </div>
    );
}
