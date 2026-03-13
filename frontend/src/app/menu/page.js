"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import Layout from "@/components/layout";
import menuData from "@/mock/menu.json";

export default function MenuPage() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";

  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch] = useState("");

  const filteredItems = useMemo(() => {
    return menuData.filter((item) => {
      const categoryMatch = category === "all" || item.category === category;
      const searchMatch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase());

      return categoryMatch && searchMatch;
    });
  }, [category, search]);

  const getCategoryHeading = () => {
    if (category === "veg") return "Pure veg picks";
    if (category === "nonveg") return "Hearty non-veg favourites";
    if (category === "snacks") return "Quick cravings & cool sips";
    return "Pick your craving";
  };

  const getCategorySub = () => {
    if (category === "veg") {
      return "From dosa to rice bowls, explore comforting vegetarian favourites made for campus appetite.";
    }
    if (category === "nonveg") {
      return "Flavour-packed biryani, chicken bites, and protein-rich quick meals—all in one place.";
    }
    if (category === "snacks") {
      return "Softies, chats, juices, tea, and coffee for fast refreshment between classes.";
    }
    return "Fresh meals, quick bites, and campus favourites—all lined up for faster pickup.";
  };

  return (
    <Layout>
      <div className="menuHero">
        <div className="menuHeroText">
          <div className="menuKicker">Campus menu</div>
          <h1 className="sectionHeading">{getCategoryHeading()}</h1>
          <p className="sectionSub">{getCategorySub()}</p>
        </div>
      </div>

      <div className="menuControls">
        <div className="searchRow menuSearchRow">
          <button
            className={`filterChip ${category === "all" ? "active" : ""}`}
            onClick={() => setCategory("all")}
          >
            All
          </button>

          <button
            className={`filterChip ${category === "veg" ? "active" : ""}`}
            onClick={() => setCategory("veg")}
          >
            Veg
          </button>

          <button
            className={`filterChip ${category === "nonveg" ? "active" : ""}`}
            onClick={() => setCategory("nonveg")}
          >
            Non-Veg
          </button>

          <button
            className={`filterChip ${category === "snacks" ? "active" : ""}`}
            onClick={() => setCategory("snacks")}
          >
            Snacks & Drinks
          </button>

          <input
            className="searchInput"
            placeholder="Search your favourite meal or drink"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="gridCards menuGridRefined">
        {filteredItems.map((item) => (
          <div className="foodCard foodCardRefined" key={item.id}>
            <div className="foodThumbWrap">
              <Image
                src={item.image}
                alt={item.name}
                width={420}
                height={260}
                className="foodThumb"
              />

              <div className="foodTopTag">
                {item.category === "veg"
                  ? "Veg"
                  : item.category === "nonveg"
                  ? "Non-Veg"
                  : "Snacks"}
              </div>
            </div>

            <div className="foodBody">
              <h3 className="foodName">{item.name}</h3>
              <p className="foodDesc">{item.description}</p>

              <div className="foodMeta">
                <div>
                  <div className="foodPrice">₹{item.price}</div>
                  <div className="foodMetaSub">Freshly available</div>
                </div>

                <button className="buyBtn">Buy</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="emptyState">
          <h3>No matching items found</h3>
          <p>Try a different keyword or switch to another category.</p>
        </div>
      )}
    </Layout>
  );
}