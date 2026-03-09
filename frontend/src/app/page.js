import Image from "next/image";

export default function Home() {
  return (
    <div className="appShell">
      <section className="homeHero">
        <header className="heroHeader">
          <div className="brandWrap">
            <div className="brandLogo">S</div>
            <div className="brandText">
              <h1>SIST Smart Canteen</h1>
              <p>Skip the queue, Savour the meal</p>
            </div>
          </div>

          <nav className="heroNav">
            <a href="/menu">Menu</a>
            <a href="/orders">Orders</a>
            <a href="/staff/orders">Staff</a>
            <a href="/login?role=student" className="signInBtn">
              Sign in
            </a>
          </nav>
        </header>

        <div className="heroSideImage heroLeftImage">
          <Image src="/hero-food.png" alt="Veg canteen food" fill style={{ objectFit: "contain" }} priority />
        </div>

        <div className="heroSideImage heroRightImage">
          <Image src="/login-food.png" alt="Non veg canteen food" fill style={{ objectFit: "contain" }} priority />
        </div>

        <div className="heroContent">
          <h2>
            Order food smarter.
            <br />
            Discover your campus
            <br />
            canteen flow.
          </h2>

          <p>
            Premium slot-based ordering for Sathyabama students with staff approval,
            live tracking, and a faster pickup experience.
          </p>

          <div className="heroSearchArea">
            <select className="heroSelect" defaultValue="">
              <option value="" disabled>Select canteen</option>
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

      <section className="categoryCards">
        <a href="/menu?category=veg" className="categoryCard">
          <div className="categoryText">
            <div className="categoryTitle">VEG</div>
            <div className="categorySubtitle">Meals • Dosa • Fried Rice</div>
            <div className="categoryBadge">Pure Veg Choices</div>
          </div>
          <div className="categoryImageWrap">
            <Image src="/hero-food.png" alt="Veg category" fill style={{ objectFit: "cover" }} />
          </div>
          <div className="categoryArrow">→</div>
        </a>

        <a href="/menu?category=nonveg" className="categoryCard">
          <div className="categoryText">
            <div className="categoryTitle">NON-VEG</div>
            <div className="categorySubtitle">Biryani • Chicken 65 • Omelette</div>
            <div className="categoryBadge">Hearty Meal Favourites</div>
          </div>
          <div className="categoryImageWrap">
            <Image src="/login-food.png" alt="Non veg category" fill style={{ objectFit: "cover" }} />
          </div>
          <div className="categoryArrow">→</div>
        </a>

        <a href="/menu?category=snacks" className="categoryCard">
          <div className="categoryText">
            <div className="categoryTitle">SNACKS & DRINKS</div>
            <div className="categorySubtitle">Softies • Chats • Fresh Juices • Tea/Coffee</div>
            <div className="categoryBadge">Quick Cravings</div>
          </div>
          <div className="categoryImageWrap">
            <Image src="/hero-food.png" alt="Snacks category" fill style={{ objectFit: "cover" }} />
          </div>
          <div className="categoryArrow">→</div>
        </a>
      </section>
    </div>
  );
}