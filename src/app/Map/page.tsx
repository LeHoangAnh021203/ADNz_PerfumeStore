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
        <main className="font-mono min-h-screen w-full relative overflow-hidden flex flex-col md:block px-6 pt-12 md:pt-16 bg-gradient-to-b from-[#05070b] to-[#0a0d14] text-zinc-100 [--ds-background-100:#05070b] [--ds-background-200:#0b1020] [--ds-gray-1000:#f4f4f5] [--ds-gray-900:#c4c7cf] [--ds-gray-500:#71717a] [--ds-gray-400:#3f3f46] [--ds-gray-200:#27272a]">
                  <Header/>
            <div className="w-full space-y-1.5 mx-auto mt-1 mb-12">
                <MapMetricsProvider>
                    <div className="flex flex-col min-[961px]:hidden">
                        <header className="flex flex-col items-start font-mono text-sm uppercase gap-2 mb-6">
                            <p className="text-zinc-100 font-mono my-0 whitespace-nowrap">
                                Black Friday - Cyber Monday{" "}
                                <span className="block font-mono text-zinc-400">
                                    [11.28.25 - 12.01.25]
                                </span>
                            </p>
                        </header>

                        <section className="pb-6 w-full">
                            <div className="flex flex-col gap-y-6">
                                <TotalRequests />
                                <TopCountries />
                            </div>
                            <RegionCount />
                        </section>

                        <div className="w-full flex justify-center pointer-events-none">
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

                    <section className="mt-8">
                        <StatsGrid />
                    </section>
                </MapMetricsProvider>
            </div>
            <Footer/>
        </main>
    );
}
