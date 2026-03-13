import Image from "next/image";

export default function Home() {
  return (
    <div className="appShell">
      <section className="homeHero homeHeroRefined">
        <header className="heroHeader heroHeaderRefined">
          <div className="brandWrap brandWrapRefined">
            <div className="brandLogo brandLogoImageWrap">
              <Image
                src="/sathyabama-logo.png"
                alt="Sathyabama Logo"
                width={56}
                height={56}
                className="brandLogoImage"
                priority
              />
            </div>

            <div className="brandText brandTextRefined">
              <h1>SIST Smart Canteen</h1>
              <p>Skip the queue, Savour the meal</p>
            </div>
          </div>

          <nav className="heroNav heroNavRefined">
            <a href="/menu">Menu</a>
            <a href="/orders">Orders</a>
            <a href="/staff/orders">Staff</a>
            <a href="/login?role=student" className="signInBtn">
              Sign in
            </a>
          </nav>
        </header>

        <div className="heroGlow heroGlowLeft" />
        <div className="heroGlow heroGlowRight" />

        <div className="heroSideImage heroLeftImage heroFoodRefined">
          <Image
            src="/hero-food.png"
            alt="Veg canteen food"
            fill
            style={{ objectFit: "contain" }}
            priority
          />
        </div>

        <div className="heroSideImage heroRightImage heroFoodRefined">
          <Image
            src="/login-food.png"
            alt="Non veg canteen food"
            fill
            style={{ objectFit: "contain" }}
            priority
          />
        </div>

        <div className="heroContent heroContentRefined">
          <h2>
            Order food smarter.
            <br />
            Discover your campus
            <br />
            canteen flow.
          </h2>

          <p>
            Slot-based ordering for Sathyabama students with cleaner pickup,
            faster approval, and a smoother meal experience every day.
          </p>

          <div className="heroSearchArea heroSearchAreaRefined">
            <select className="heroSelect" defaultValue="">
              <option value="" disabled>
                Select canteen
              </option>
              <option value="main">Main Canteen</option>
              <option value="scas">SCAS Canteen</option>
            </select>

            <input
              className="heroSearchInput"
              type="text"
              placeholder="Search for dosa, biryani, tea or more"
            />
          </div>
        </div>
      </section>

      <section className="categoryCards categoryCardsRefined">
        <a href="/menu?category=veg" className="categoryCard categoryCardRefined">
          <div className="categoryText categoryTextBalanced">
            <div className="categoryTitle categoryTitleBalanced">VEG</div>
            <div className="categorySubtitle categorySubtitleBalanced">
              Meals • Dosa • Fried Rice
            </div>
            <div className="categoryBadge categoryBadgeBalanced">
              Pure Veg Choices
            </div>
          </div>

          <div className="categoryImageWrap categoryImageWrapRefined">
            <Image
              src="/hero-food.png"
              alt="Veg category"
              fill
              style={{ objectFit: "cover" }}
            />
          </div>

          <div className="categoryArrow">→</div>
        </a>

        <a href="/menu?category=nonveg" className="categoryCard categoryCardRefined">
          <div className="categoryText categoryTextBalanced">
            <div className="categoryTitle categoryTitleBalanced">NON-VEG</div>
            <div className="categorySubtitle categorySubtitleBalanced">
              Biryani • Chicken 65 • Omelette
            </div>
            <div className="categoryBadge categoryBadgeBalanced">
              Hearty Meal Favourites
            </div>
          </div>

          <div className="categoryImageWrap categoryImageWrapRefined">
            <Image
              src="/login-food.png"
              alt="Non veg category"
              fill
              style={{ objectFit: "cover" }}
            />
          </div>

          <div className="categoryArrow">→</div>
        </a>

        <a href="/menu?category=snacks" className="categoryCard categoryCardRefined">
          <div className="categoryText categoryTextBalanced categoryTextSnacksFixed">
            <div className="categoryTitle categoryTitleBalanced categoryTitleSnacksFixed">
              SNACKS & DRINKS
            </div>
            <div className="categorySubtitle categorySubtitleBalanced">
              Softies • Chats • Fresh Juices • Tea/Coffee
            </div>
            <div className="categoryBadge categoryBadgeBalanced">
              Quick Cravings
            </div>
          </div>

          <div className="categoryImageWrap categoryImageWrapRefined">
            <Image
              src="/hero-food.png"
              alt="Snacks and drinks category"
              fill
              style={{ objectFit: "cover" }}
            />
          </div>

          <div className="categoryArrow">→</div>
        </a>
      </section>
    </div>
  );
}