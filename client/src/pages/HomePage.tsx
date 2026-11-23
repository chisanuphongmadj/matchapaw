import type { ReactElement } from "react";
import { Link, useNavigate } from "react-router";
import { ErrorAlert } from "../components/ui/ErrorAlert";
import { PawIcon } from "../components/ui/Icons";
import { useSpecies, useStats } from "../features/meta/metaApi";
import { usePets } from "../features/pets/petApi";
import { PetGrid } from "../features/pets/components/PetCard";
import { PetImage } from "../features/pets/components/PetImage";
import { speciesEmoji } from "../lib/format";
import { useFilterStore } from "../stores/filterStore";

const steps = [
  { emoji: "🔍", title: "ค้นหาน้องที่ใช่", text: "กรองตามชนิด ขนาด อายุ และนิสัยที่เข้ากับไลฟ์สไตล์ของคุณ" },
  { emoji: "📝", title: "ส่งคำขอรับเลี้ยง", text: "กรอกข้อมูลสั้น ๆ บ้านพักพิงจะติดต่อกลับเพื่อนัดพูดคุย" },
  { emoji: "🏡", title: "พาน้องกลับบ้าน", text: "เมื่อได้รับอนุมัติ ก็พร้อมเริ่มต้นชีวิตใหม่ด้วยกัน" },
] as const;

export function HomePage(): ReactElement {
  const navigate = useNavigate();
  const resetFilters = useFilterStore((state) => state.reset);
  const setFilter = useFilterStore((state) => state.setFilter);

  const stats = useStats();
  const species = useSpecies();
  const latest = usePets({ status: "AVAILABLE", sort: "newest", limit: 8 });
  const heroPets = latest.data?.data.filter((p) => p.imageUrl).slice(0, 4) ?? [];

  // กดปุ่มชนิดสัตว์ -> ตั้งค่าตัวกรองใน Zustand แล้วไปหน้า /pets (หน้านั้นอ่านค่าเดียวกัน)
  const browseSpecies = (speciesId: number): void => {
    resetFilters();
    setFilter("speciesId", speciesId);
    void navigate("/pets");
  };

  const statItems = [
    { label: "น้องรอบ้าน", value: stats.data?.available, className: "text-primary" },
    { label: "รอพิจารณา", value: stats.data?.pending, className: "text-warning" },
    { label: "ได้บ้านแล้ว", value: stats.data?.adopted, className: "text-secondary" },
    { label: "บ้านพักพิงเครือข่าย", value: stats.data?.shelters, className: "text-info" },
  ];

  return (
    <div className="space-y-14">
      {/* Hero */}
      <section className="grid items-center gap-8 lg:grid-cols-2">
        <div className="space-y-5">
          <span className="badge badge-primary badge-soft gap-1">
            <PawIcon className="size-3.5" /> Community &amp; Social Impact
          </span>
          <h1 className="text-4xl leading-tight font-bold sm:text-5xl">
            จับคู่หัวใจ
            <br />
            <span className="text-primary">ให้ทุกอุ้งเท้ามีบ้าน</span>
          </h1>
          <p className="max-w-lg text-lg text-base-content/75">
            MatchAPaw รวบรวมสุนัข แมว และกระต่ายจรจากบ้านพักพิงทั่วประเทศ
            ให้คุณค้นหาเพื่อนสี่ขาที่เข้ากับไลฟ์สไตล์ และส่งคำขอรับเลี้ยงได้ในไม่กี่คลิก
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/pets" className="btn btn-primary btn-lg">
              ค้นหาน้องเลย
            </Link>
            <Link to="/favorites" className="btn btn-ghost btn-lg">
              รายการโปรดของฉัน
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {latest.isLoading
            ? Array.from({ length: 4 }, (_, i) => <div key={i} className="skeleton aspect-square rounded-box" />)
            : heroPets.map((pet, i) => (
                <Link
                  key={pet.id}
                  to={`/pets/${pet.id}`}
                  className={`overflow-hidden rounded-box shadow-md transition hover:scale-[1.02] ${i % 2 === 1 ? "translate-y-6" : ""}`}
                >
                  <PetImage
                    src={pet.imageUrl}
                    alt={pet.name}
                    speciesSlug={pet.species.slug}
                    className="aspect-square w-full"
                  />
                </Link>
              ))}
        </div>
      </section>

      {/* สถิติ */}
      <section aria-label="สถิติ">
        {stats.isError ? (
          <ErrorAlert error={stats.error} onRetry={() => void stats.refetch()} />
        ) : (
          <div className="stats stats-vertical w-full border border-base-300 bg-base-100 shadow-sm sm:stats-horizontal">
            {statItems.map((item) => (
              <div key={item.label} className="stat place-items-center">
                <div className="stat-title">{item.label}</div>
                <div className={`stat-value ${item.className}`}>
                  {stats.isLoading ? <span className="skeleton inline-block h-9 w-14" /> : item.value}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* เลือกตามชนิด */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">มองหาเพื่อนแบบไหน?</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {species.isLoading &&
            Array.from({ length: 3 }, (_, i) => <div key={i} className="skeleton h-28 rounded-box" />)}
          {species.data?.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => browseSpecies(s.id)}
              className="card border border-base-300 bg-base-100 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
            >
              <span className="text-4xl" aria-hidden="true">
                {speciesEmoji(s.slug)}
              </span>
              <span className="mt-2 text-lg font-semibold">{s.name}</span>
              <span className="text-sm text-base-content/60">{s._count?.pets ?? 0} ตัวในระบบ</span>
            </button>
          ))}
        </div>
      </section>

      {/* น้องมาใหม่ */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">น้องที่เพิ่งมาใหม่</h2>
            <p className="text-base-content/70">รอพบครอบครัวที่ใช่อยู่ตอนนี้</p>
          </div>
          <Link to="/pets" className="btn btn-ghost btn-sm">
            ดูทั้งหมด →
          </Link>
        </div>
        {latest.isError ? (
          <ErrorAlert error={latest.error} onRetry={() => void latest.refetch()} />
        ) : (
          <PetGrid pets={latest.data?.data} isLoading={latest.isLoading} skeletonCount={8} />
        )}
      </section>

      {/* ขั้นตอน */}
      <section className="rounded-box bg-primary/10 p-6 sm:p-10">
        <h2 className="mb-6 text-center text-2xl font-bold">รับเลี้ยงง่าย ๆ ใน 3 ขั้นตอน</h2>
        <ol className="grid gap-6 sm:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step.title} className="flex flex-col items-center text-center">
              <span className="text-4xl" aria-hidden="true">
                {step.emoji}
              </span>
              <h3 className="mt-2 font-semibold">
                {i + 1}. {step.title}
              </h3>
              <p className="mt-1 text-sm text-base-content/70">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
