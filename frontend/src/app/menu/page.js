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
      const mappedCategory =
        item.category === "drinks" ? "snacks" : item.category;

      const categoryMatch =
        category === "all" || mappedCategory === category;

      const searchMatch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.description || "")
          .toLowerCase()
          .includes(search.toLowerCase());

      return categoryMatch && searchMatch;
    });
  }, [category, search]);

  const groupedItems = useMemo(() => {
    if (category !== "all") return null;

    return {
      veg: filteredItems.filter((item) => item.category === "veg"),
      nonveg: filteredItems.filter((item) => item.category === "nonveg"),
      snacks: filteredItems.filter(
        (item) => item.category === "snacks" || item.category === "drinks"
      )
    };
  }, [category, filteredItems]);

  const getTitle = () => {
    if (category === "veg") return "Pure veg picks";
    if (category === "nonveg") return "Hearty non-veg favourites";
    if (category === "snacks") return "Snacks, chats & cool drinks";
    return "Pick your craving";
  };

  const getSubtitle = () => {
    if (category === "veg") {
      return "Comfort meals, dosa favourites, and canteen classics made for everyday hunger.";
    }
    if (category === "nonveg") {
      return "Biryani, fried rice, noodles, and quick protein-heavy favourites.";
    }
    if (category === "snacks") {
      return "Tea, coffee, juices, chaat, and quick bites for short breaks and evening cravings.";
    }
    return "Browse the campus menu by category and discover what fits your hunger best.";
  };

  const renderCard = (item) => (
    <div className="foodCard foodCardPremium" key={item.id}>
      <div className="foodImageWrap">
        <Image
          src={item.image}
          alt={item.name}
          width={600}
          height={400}
          className="foodThumb foodThumbPremium"
        />
        <div className="foodOverlayTag">
          {item.category === "veg"
            ? "Veg"
            : item.category === "nonveg"
            ? "Non-Veg"
            : "Snacks & Drinks"}
        </div>
      </div>

      <div className="foodBody foodBodyPremium">
        <div className="foodHeaderRow">
          <h3 className="foodName">{item.name}</h3>
          <div className="foodPrice">₹{item.price}</div>
        </div>

        <p className="foodDesc">
          {item.description || "Freshly prepared canteen favourite."}
        </p>

        <div className="foodFooterRow">
          <div className="foodMetaSub">Freshly available</div>
          <button className="buyBtn">Add</button>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="menuHero">
        <div>
          <div className="menuKicker">Campus menu</div>
          <h1 className="sectionHeading">{getTitle()}</h1>
          <p className="sectionSub">{getSubtitle()}</p>
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
            placeholder="Search for dosa, biryani, coffee or more"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {category === "all" && groupedItems ? (
        <div className="menuSections">
          <section className="menuSectionBlock">
            <div className="menuSectionHead">
              <h2>Veg</h2>
              <p>Comforting vegetarian favourites</p>
            </div>
            <div className="gridCards">
              {groupedItems.veg.map(renderCard)}
            </div>
          </section>

          <section className="menuSectionBlock">
            <div className="menuSectionHead">
              <h2>Non-Veg</h2>
              <p>Hearty meal picks and rich flavours</p>
            </div>
            <div className="gridCards">
              {groupedItems.nonveg.map(renderCard)}
            </div>
          </section>

          <section className="menuSectionBlock">
            <div className="menuSectionHead">
              <h2>Snacks & Drinks</h2>
              <p>Quick bites, chats, juices, tea and coffee</p>
            </div>
            <div className="gridCards">
              {groupedItems.snacks.map(renderCard)}
            </div>
          </section>
        </div>
      ) : (
        <div className="gridCards">
          {filteredItems.map(renderCard)}
        </div>
      )}

      {filteredItems.length === 0 && (
        <div className="emptyState">
          <h3>No matching items found</h3>
          <p>Try another keyword or switch to a different category.</p>
        </div>
      )}
    </Layout>
  );
}