"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import Layout from "@/components/layout";

export default function HomePage() {
  const router = useRouter();

  return (
    <Layout>
      <div className="homePageOrangeShell">
        <section className="homeHeroFinal">
          <div className="homeHeroFinalGlow" />

          <div className="homeHeroFinalContent">
            <h1 className="homeHeroFinalTitle">
              Order food smarter.
              <br />
              Discover your campus
              <br />
              canteen flow.
            </h1>

            <p className="homeHeroFinalSubtitle">
              Premium slot-based ordering for Sathyabama students with staff
              approval, live tracking, and a faster pickup experience.
            </p>

            <div className="homeHeroFinalSearchRow">
              <select className="homeHeroFinalField" defaultValue="">
                <option value="" disabled>
                  Select canteen
                </option>
                <option value="main">Main Canteen</option>
                <option value="scas">SCAS Canteen</option>
              </select>

              <input
                className="homeHeroFinalField"
                type="text"
                placeholder="Search for dosa, biryani, tea or more"
              />
            </div>
          </div>

          <div className="homeHeroFinalLeftFood">
            <Image
              src="/hero-veg-thali.png"
              alt="Veg meals"
              width={280}
              height={280}
              className="homeHeroFinalSideImage"
              priority
            />
          </div>

          <div className="homeHeroFinalRightFood">
            <Image
              src="/hero-nonveg-thali.png"
              alt="Non veg meals"
              width={280}
              height={280}
              className="homeHeroFinalSideImage"
              priority
            />
          </div>
        </section>

        <section className="homeCategoryGridFinal">
          <div
            className="homeCategoryCardFinal"
            onClick={() => router.push("/menu?category=veg")}
          >
            <div className="homeCategoryTopFinal">
              <h2>VEG</h2>
              <p>Meals • Dosa • Fried Rice</p>
              <span>Pure Veg Choices</span>
            </div>

            <div className="homeCategoryBottomFinal">
              <button className="homeArrowFinal" aria-label="Open veg menu">
                →
              </button>

              <Image
                src="/hero-veg-thali.png"
                alt="Veg category"
                width={150}
                height={150}
                className="homeCategoryImageFinal"
              />
            </div>
          </div>

          <div
            className="homeCategoryCardFinal"
            onClick={() => router.push("/menu?category=nonveg")}
          >
            <div className="homeCategoryTopFinal">
              <h2>NON-VEG</h2>
              <p>Biryani • Chicken • Omelette</p>
              <span>Hearty Meal Favourites</span>
            </div>

            <div className="homeCategoryBottomFinal">
              <button className="homeArrowFinal" aria-label="Open non veg menu">
                →
              </button>

              <Image
                src="/hero-nonveg-thali.png"
                alt="Non veg category"
                width={150}
                height={150}
                className="homeCategoryImageFinal"
              />
            </div>
          </div>

          <div
            className="homeCategoryCardFinal"
            onClick={() => router.push("/menu?category=snacks")}
          >
            <div className="homeCategoryTopFinal">
              <h2>SNACKS & DRINKS</h2>
              <p>Softies • Chats • Fresh Juices • Tea/Coffee</p>
              <span>Quick Cravings</span>
            </div>

            <div className="homeCategoryBottomFinal">
              <button className="homeArrowFinal" aria-label="Open snacks menu">
                →
              </button>

              <Image
                src="/hero-snacks-drinks.png"
                alt="Snacks and drinks category"
                width={150}
                height={150}
                className="homeCategoryImageFinal"
              />
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}