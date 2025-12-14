export default function HomePage() {
    return <div className="flex flex-col w-full h-80">
        <div className="flex flex-col justify-center items-center w-full h-full bg-slate-100">
            <h3 className="text-lg text-black ">Hello Page</h3>

        </div>
        <div className="flex flex-row justify-center w-full space-x-5 p-4">
            <a>Home</a>
            <a>Featured</a>
            <a>Sales</a>
            <a>Featured</a>
            <a>Sales</a>
        </div>
    </div>
}