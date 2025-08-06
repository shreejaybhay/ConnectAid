"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function CTASection() {
  const router = useRouter();

  return (
    <section className="py-16 bg-accent">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col gap-8 items-center">
            {/* Image Column */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md">
                <Image
                  src="/pro png2.png"
                  alt="Two people collaborating on laptops, representing community connection and support"
                  width={400}
                  height={300}
                  className="w-full h-auto object-contain"
                  priority
                />
              </div>
            </div>
            {/* Content Column */}
            <div className="text-center lg:text-left flex flex-col items-center">
              {/* Title */}
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Ready to Make a Difference?
              </h2>

              {/* Subtext */}
              <p className="text-lg text-muted-foreground mb-8">
                Join ConnectAid to help your community or get the support you
                need.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
                <Button
                  variant="default"
                  size="lg"
                  onClick={() => router.push("/register")}
                  className="w-full sm:w-auto min-w-[160px]"
                >
                  Post a Request
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => router.push("/register")}
                  className="w-full sm:w-auto min-w-[160px]"
                >
                  Become a Volunteer
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
