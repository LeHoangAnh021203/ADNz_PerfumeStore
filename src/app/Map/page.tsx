import MapContainer from "./components/MapContainer";
import {
    MapMetricsProvider,
    TotalRequests,
    TopCountries,
    RegionCount,
    StatsGrid,
} from "./components/StatsDisplay";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";

export default function Home() {
    return (
        <main className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-[#05070b] to-[#0a0d14] px-3 pb-12 pt-[124px] font-mono text-zinc-100 md:block md:px-6 md:pb-0 md:pt-16 [--ds-background-100:#05070b] [--ds-background-200:#0b1020] [--ds-gray-1000:#f4f4f5] [--ds-gray-900:#c4c7cf] [--ds-gray-500:#71717a] [--ds-gray-400:#3f3f46] [--ds-gray-200:#27272a]">
            <Header />
            <div className="mx-auto mt-1 w-full space-y-2 md:mb-12 md:space-y-1.5">
                <MapMetricsProvider>
                    <div className="flex flex-col min-[961px]:hidden">
                        <header className="mb-4 flex flex-col items-start gap-1 text-sm uppercase">
                            <p className="my-0 text-zinc-100">Visitor Dashboard</p>
                            <span className="text-xs text-zinc-400">Realtime by country / city / district</span>
                        </header>

                        <section className="w-full pb-5">
                            <div className="flex flex-col gap-y-5">
                                <TotalRequests />
                                <TopCountries />
                            </div>
                            <RegionCount />
                        </section>

                        <div className="pointer-events-none mb-3 w-full">
                            <MapContainer />
                        </div>
                    </div>

                    <div className="relative hidden min-[961px]:flex flex-row max-lg:items-end lg:items-center lg:justify-between">
                        <header className="flex flex-col items-start font-mono text-sm xl:text-base uppercase gap-2 max-lg:mb-8 mb-auto pt-5">
                            <p className="text-zinc-100 font-mono my-0 whitespace-nowrap">
                            Total number of visitors to the website
                            </p>
                        </header>

                        <section className="lg:absolute lg:bottom-0 pb-6 w-fit z-10 relative">
                            <div className="flex flex-col gap-y-8">
                                <TotalRequests />
                                <TopCountries />
                            </div>
                            <RegionCount />
                        </section>

                        <div className="w-full h-full pointer-events-none max-lg:scale-[1.5] max-lg:-translate-y-16 max-lg:translate-x-[-20%]">
                            <MapContainer />
                        </div>
                    </div>

                    <section className="mt-4 md:mt-8">
                        <StatsGrid />
                    </section>
                </MapMetricsProvider>
            </div>
            <Footer />
        </main>
    );
}
