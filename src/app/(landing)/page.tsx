"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { BarChart3, Receipt, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen ">
      <div className="mx-auto max-w-screen-lg px-4 py-12 sm:py-20">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-balance bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Split expenses with friends, simply.
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground text-balance max-w-2xl mx-auto leading-relaxed">
            FairShare makes splitting bills effortless. Create groups, track expenses, and settle up automatically with
            a clean, intuitive interface.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-base">
              <Link href="/login">Get started free</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base bg-transparent">
              <Link href="/dashboard">View demo</Link>
            </Button>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-16 sm:mt-24 grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          {[
            {
              icon: Users,
              title: "Invite friends easily",
              desc: "Send email invites and add friends to groups with one click. No hassle, just simplicity.",
            },
            {
              icon: Receipt,
              title: "Smart bill splitting",
              desc: "Split equally, by percentage, or exact amounts. Upload receipts and add notes for clarity.",
            },
            {
              icon: BarChart3,
              title: "Clear insights",
              desc: "Visualize spending trends with charts. See who owes whom at a glance with minimized settlements.",
            },
            {
              icon: ShieldCheck,
              title: "Private & secure",
              desc: "Your financial data is encrypted and private. We never share your information with third parties.",
            },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="p-6 flex gap-4 items-start">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <feature.icon className="size-6 text-primary" aria-hidden />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.section>

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-16 sm:mt-24 text-center"
        >
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-8 sm:p-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-balance">Ready to simplify your expenses?</h2>
              <p className="mt-3 text-muted-foreground text-balance max-w-xl mx-auto">
                Join thousands of users who trust FairShare to manage their shared expenses.
              </p>
              <Button asChild size="lg" className="mt-6">
                <Link href="/login">Start splitting now</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </div>
  );
}
