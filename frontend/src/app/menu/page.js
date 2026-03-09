"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Layout from "@/components/layout";
import menuData from "@/mock/menu.json";

export default function MenuPage() {
  const [category, setCategory] = useState("all");
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

  return (
    <Layout>
      <h1 className="sectionHeading">Pick your craving</h1>
      <p className="sectionSub">
        Fresh campus favourites, comfort meals, and quick sips — all lined up for faster pickup.
      </p>

      <div className="searchRow">
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

      <div className="gridCards">
        {filteredItems.map((item) => (
          <div className="foodCard" key={item.id}>
            <Image
              src={item.image}
              alt={item.name}
              width={420}
              height={260}
              className="foodThumb"
            />
            <div className="foodBody">
              <h3 className="foodName">{item.name}</h3>
              <p className="foodDesc">{item.description}</p>

              <div className="foodMeta">
                <div className="foodPrice">₹{item.price}</div>
                <button className="buyBtn">Buy</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}