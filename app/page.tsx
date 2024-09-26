import { DefaultHero } from './components/Hero'
import { Steps } from './components/AltDirectToOpenAi'
import { NavBar } from './components/NavBar'

export default function Home() {
  return (
    <main>
      <DefaultHero />
      <Steps />
    </main>
    
  );
}
