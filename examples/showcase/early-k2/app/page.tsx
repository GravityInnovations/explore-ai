import Link from "next/link";
import { Illustration } from "@/components/Illustration";

export default function HomePage() {
  return (
    <div className="page-content home">
      <p className="eyebrow">Kindergarten – Grade 2 <span aria-hidden="true">·</span> Ages 5–7</p>
      <h1>A little space for<br /><span>big curiosity.</span></h1>
      <p className="intro">Welcome to ExploreAI.<br />Take your time. There’s room to wonder.</p>
      <Link href="/catalog" className="button primary">Explore lessons <span aria-hidden="true">→</span></Link>
      <Illustration />
      <p className="home-note">Little steps. Your own pace.</p>
    </div>
  );
}
