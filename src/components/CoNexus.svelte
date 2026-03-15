<script lang="ts">
  import { toast } from '@stores/toast.svelte';
  import PullRefresh from '@components/ui/PullRefresh.svelte';
  import PortalLoader from '@components/ui/PortalLoader.svelte';
  import Tile from '@components/ui/Tile.svelte';
  import StoryCategory from '@components/ui/StoryCategory.svelte';
  import LoadMore from '@components/ui/LoadMore.svelte';
  import Skeleton from '@components/ui/Skeleton.svelte';
  import { GripVertical, ChevronLeft, ChevronRight } from '@lucide/svelte';
  import Restart from '@components/icons/Restart.svelte';
  import ActionBtn from '@components/ui/ActionBtn.svelte';
  import { draggable, dropTarget, reorderByDrop } from '@actions/drag';
  import { live, emerge, dissolve } from '@lib/transitions.svelte';

  let portalStatus = $state<'idle' | 'loading'>('loading');

  function interceptDemoLink(e: MouseEvent | KeyboardEvent) {
    if (e instanceof KeyboardEvent && e.key !== 'Enter') return;
    const anchor = (e.target as HTMLElement).closest('a');
    if (anchor?.getAttribute('href') === '#') {
      e.preventDefault();
      toast.show('Demo link — no navigation', 'info');
    }
  }

  async function handleRefresh(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  function handleRefreshError(error: unknown): void {
    console.error('Refresh error:', error);
  }

  // ── Types ────────────────────────────────────────────────────────────────

  interface StoryData {
    title: string;
    href: string;
    author: { name: string; avatar?: string; href?: string };
    genres: string[];
    image: string;
    mark?: 'resume' | 'complete' | 'replay';
    gated?: boolean;
  }

  interface CategoryDef {
    id: string;
    title: string;
    tagline: string;
    stories: StoryData[];
  }

  // ── Tile-level pagination (horizontal) ──────────────────────────────────
  // Simulates backend pagination: starts with `initialSize` tiles visible,
  // loads `pageSize` more per scroll with a network delay.

  const TILE_PAGE_SIZE = 4;
  const TILE_INITIAL_SIZE = 6;
  const TILE_LOAD_DELAY = 1200;

  function createTilePaginator(allStories: StoryData[]) {
    let visible = $state(allStories.slice(0, TILE_INITIAL_SIZE));
    let loading = $state(false);
    const hasMore = $derived(visible.length < allStories.length);

    function loadMore() {
      if (loading || !hasMore) return;
      loading = true;
      setTimeout(() => {
        const nextEnd = Math.min(
          visible.length + TILE_PAGE_SIZE,
          allStories.length,
        );
        visible = allStories.slice(0, nextEnd);
        loading = false;
      }, TILE_LOAD_DELAY);
    }

    return {
      get visible() {
        return visible;
      },
      get loading() {
        return loading;
      },
      get hasMore() {
        return hasMore;
      },
      loadMore,
    };
  }

  // ── Category-level pagination (vertical) ────────────────────────────────
  // Starts with `initialCount` categories visible. On loadMore, a skeleton
  // placeholder is appended immediately (using the real category id for stable
  // keyed-list identity), then replaced in-place with the resolved category
  // after the simulated delay. The tile paginator is created exactly once at
  // resolve time.

  type FeedItem =
    | {
        id: string;
        status: 'ready';
        title: string;
        tagline: string;
        paginator: ReturnType<typeof createTilePaginator>;
      }
    | {
        id: string;
        status: 'loading';
      };

  const CATEGORY_INITIAL_COUNT = 2;
  const CATEGORY_LOAD_DELAY = 800;

  function createPaginatedFeed(allCategories: CategoryDef[]) {
    let categories = $state<FeedItem[]>(
      allCategories.slice(0, CATEGORY_INITIAL_COUNT).map((def) => ({
        id: def.id,
        status: 'ready' as const,
        title: def.title,
        tagline: def.tagline,
        paginator: createTilePaginator(def.stories),
      })),
    );
    let loading = $state(false);
    const hasMore = $derived(
      categories.filter((c) => c.status === 'ready').length <
        allCategories.length,
    );

    function loadMore() {
      if (loading || !hasMore) return;

      const nextDef =
        allCategories[categories.filter((c) => c.status === 'ready').length];
      loading = true;

      categories = [...categories, { id: nextDef.id, status: 'loading' }];

      setTimeout(() => {
        categories = categories.map((item) =>
          item.id === nextDef.id && item.status === 'loading'
            ? {
                id: nextDef.id,
                status: 'ready' as const,
                title: nextDef.title,
                tagline: nextDef.tagline,
                paginator: createTilePaginator(nextDef.stories),
              }
            : item,
        );
        loading = false;
      }, CATEGORY_LOAD_DELAY);
    }

    return {
      get categories() {
        return categories;
      },
      get loading() {
        return loading;
      },
      get hasMore() {
        return hasMore;
      },
      loadMore,
    };
  }

  // ── Mock story data ─────────────────────────────────────────────────────
  const hottestStories = [
    {
      title: 'Machine Rebellion',
      href: '#',
      author: {
        name: 'Ada Sterling',
        avatar: 'https://i.pravatar.cc/48?u=ada',
        href: '#',
      },
      genres: ['Psychological', 'Sci-Fi'],
      image: 'https://picsum.photos/seed/hot1/400/600',
      mark: 'resume' as const,
    },
    {
      title: 'The Last Archive',
      href: '#',
      author: {
        name: 'Marcus Voss',
        avatar: 'https://i.pravatar.cc/48?u=marcus',
        href: '#',
      },
      genres: ['Mystery', 'Historical'],
      image: 'https://picsum.photos/seed/hot2/400/600',
      mark: 'complete' as const,
      gated: true,
    },
    {
      title: 'Neon Requiem',
      href: '#',
      author: { name: 'Zara Okafor', href: '#' },
      genres: ['Cyberpunk', 'Thriller'],
      image: 'https://picsum.photos/seed/hot3/400/600',
    },
    {
      title: 'Verdant Echoes',
      href: '#',
      author: {
        name: 'Liam Chen',
        avatar: 'https://i.pravatar.cc/48?u=liam',
        href: '#',
      },
      genres: ['Fantasy'],
      image: 'https://picsum.photos/seed/hot4/400/600',
      mark: 'replay' as const,
      gated: true,
    },
    {
      title: 'Crimson Meridian',
      href: '#',
      author: {
        name: 'Ivy Nakamura',
        avatar: 'https://i.pravatar.cc/48?u=ivy',
        href: '#',
      },
      genres: ['Horror', 'Supernatural'],
      image: 'https://picsum.photos/seed/hot5/400/600',
    },
    {
      title: 'Dust & Diesel',
      href: '#',
      author: {
        name: 'Hank Calloway',
        avatar: 'https://i.pravatar.cc/48?u=hank',
        href: '#',
      },
      genres: ['Western', 'Post-Apocalyptic'],
      image: 'https://picsum.photos/seed/hot6/400/600',
    },
    {
      title: "The Cartographer's Lie",
      href: '#',
      author: {
        name: 'Selene Moreau',
        avatar: 'https://i.pravatar.cc/48?u=selene',
        href: '#',
      },
      genres: ['Espionage', 'Historical Fiction'],
      image: 'https://picsum.photos/seed/hot7/400/600',
      mark: 'resume' as const,
      gated: true,
    },
    {
      title: 'Bone Garden',
      href: '#',
      author: { name: 'Tomás Reyes', href: '#' },
      genres: ['Gothic', 'Romance'],
      image: 'https://picsum.photos/seed/hot8/400/600',
    },
    {
      title: 'Starfall Protocol',
      href: '#',
      author: {
        name: 'Yuki Tanaka',
        avatar: 'https://i.pravatar.cc/48?u=yuki',
        href: '#',
      },
      genres: ['Space Opera', 'Military Sci-Fi'],
      image: 'https://picsum.photos/seed/hot9/400/600',
      mark: 'complete' as const,
    },
    {
      title: 'The Butcher of Calais',
      href: '#',
      author: {
        name: 'Émile Dufresne',
        avatar: 'https://i.pravatar.cc/48?u=emile',
        href: '#',
      },
      genres: ['Noir', 'Crime'],
      image: 'https://picsum.photos/seed/hot10/400/600',
    },
    {
      title: "Meridian's Wake",
      href: '#',
      author: { name: 'Nneka Azikiwe', href: '#' },
      genres: ['Afrofuturism', 'Mythology'],
      image: 'https://picsum.photos/seed/hot11/400/600',
    },
    {
      title: 'Clockwork Requiem',
      href: '#',
      author: {
        name: 'Beatrice Wren',
        avatar: 'https://i.pravatar.cc/48?u=beatrice',
        href: '#',
      },
      genres: ['Steampunk', 'Adventure'],
      image: 'https://picsum.photos/seed/hot12/400/600',
      mark: 'replay' as const,
    },
    {
      title: 'Beneath Still Water',
      href: '#',
      author: {
        name: 'Ronan Gallagher',
        avatar: 'https://i.pravatar.cc/48?u=ronan',
        href: '#',
      },
      genres: ['Cosmic Horror', 'Survival'],
      image: 'https://picsum.photos/seed/hot13/400/600',
    },
    {
      title: 'Paper Kingdoms',
      href: '#',
      author: { name: 'Jun-seo Park', href: '#' },
      genres: ['Political Intrigue', 'Fantasy'],
      image: 'https://picsum.photos/seed/hot14/400/600',
      mark: 'resume' as const,
    },
    {
      title: 'Velvet Uprising',
      href: '#',
      author: {
        name: 'Katarina Volk',
        avatar: 'https://i.pravatar.cc/48?u=katarina',
        href: '#',
      },
      genres: ['Revolution', 'Drama'],
      image: 'https://picsum.photos/seed/hot15/400/600',
    },
    {
      title: 'The Soma Drift',
      href: '#',
      author: {
        name: 'Dex Holloway',
        avatar: 'https://i.pravatar.cc/48?u=dex',
        href: '#',
      },
      genres: ['Biopunk', 'Psychological'],
      image: 'https://picsum.photos/seed/hot16/400/600',
    },
    {
      title: 'Oathbound',
      href: '#',
      author: { name: 'Sian Ashworth', href: '#' },
      genres: ['Dark Fantasy', 'Grimdark'],
      image: 'https://picsum.photos/seed/hot17/400/600',
      mark: 'complete' as const,
    },
    {
      title: 'Frequency Zero',
      href: '#',
      author: {
        name: 'Milo Petrov',
        avatar: 'https://i.pravatar.cc/48?u=milo',
        href: '#',
      },
      genres: ['Techno-Thriller', 'Conspiracy'],
      image: 'https://picsum.photos/seed/hot18/400/600',
      gated: true,
    },
    {
      title: 'The Porcelain Saint',
      href: '#',
      author: {
        name: 'Isabella Crane',
        avatar: 'https://i.pravatar.cc/48?u=isabella',
        href: '#',
      },
      genres: ['Religious Horror', 'Period Drama'],
      image: 'https://picsum.photos/seed/hot19/400/600',
    },
    {
      title: 'Warp & Weft',
      href: '#',
      author: { name: 'Amal Hadid', href: '#' },
      genres: ['Magical Realism', 'Family Saga'],
      image: 'https://picsum.photos/seed/hot20/400/600',
      mark: 'replay' as const,
    },
    {
      title: 'The Gilded Asylum',
      href: '#',
      author: {
        name: 'Petra Volkov',
        avatar: 'https://i.pravatar.cc/48?u=petraV',
        href: '#',
      },
      genres: ['Psychological Horror', 'Victorian'],
      image: 'https://picsum.photos/seed/hot21/400/600',
    },
    {
      title: 'Sunken Throne',
      href: '#',
      author: { name: 'Kofi Mensah', href: '#' },
      genres: ['Atlantean', 'Epic'],
      image: 'https://picsum.photos/seed/hot22/400/600',
      mark: 'resume' as const,
      gated: true,
    },
    {
      title: 'Bitter Seasons',
      href: '#',
      author: {
        name: 'Cora Whitfield',
        avatar: 'https://i.pravatar.cc/48?u=cora',
        href: '#',
      },
      genres: ['Literary Fiction', 'Generational'],
      image: 'https://picsum.photos/seed/hot23/400/600',
    },
  ];

  const beginnerStories = [
    {
      title: 'First Light',
      href: '#',
      author: { name: 'CoNexus Team', href: '#' },
      genres: ['Tutorial', 'Adventure'],
      image: 'https://picsum.photos/seed/begin1/400/600',
    },
    {
      title: 'The Whispering Woods',
      href: '#',
      author: {
        name: 'Elena Frost',
        avatar: 'https://i.pravatar.cc/48?u=elena',
        href: '#',
      },
      genres: ['Fantasy', 'Relaxing'],
      image: 'https://picsum.photos/seed/begin2/400/600',
      mark: 'complete' as const,
    },
    {
      title: 'Signal Lost',
      href: '#',
      author: {
        name: 'Kai Brandt',
        avatar: 'https://i.pravatar.cc/48?u=kai',
        href: '#',
      },
      genres: ['Sci-Fi', 'Puzzle'],
      image: 'https://picsum.photos/seed/begin3/400/600',
      gated: true,
    },
    {
      title: 'Echoes of Stone',
      href: '#',
      author: { name: 'Priya Sharma', href: '#' },
      genres: ['Historical', 'Drama'],
      image: 'https://picsum.photos/seed/begin4/400/600',
      mark: 'resume' as const,
    },
    {
      title: 'Café Encounter',
      href: '#',
      author: {
        name: 'Sophie Laurent',
        avatar: 'https://i.pravatar.cc/48?u=sophie',
        href: '#',
      },
      genres: ['Romance', 'Slice of Life'],
      image: 'https://picsum.photos/seed/begin5/400/600',
    },
    {
      title: 'The Lighthouse Keeper',
      href: '#',
      author: {
        name: 'Angus McRae',
        avatar: 'https://i.pravatar.cc/48?u=angus',
        href: '#',
      },
      genres: ['Cozy Mystery', 'Coastal'],
      image: 'https://picsum.photos/seed/begin6/400/600',
      mark: 'complete' as const,
    },
    {
      title: 'Pixel Quest',
      href: '#',
      author: { name: 'CoNexus Team', href: '#' },
      genres: ['Comedy', 'Meta'],
      image: 'https://picsum.photos/seed/begin7/400/600',
      gated: true,
    },
    {
      title: 'Letters from Nowhere',
      href: '#',
      author: { name: 'Diana Voss', href: '#' },
      genres: ['Epistolary', 'Heartfelt'],
      image: 'https://picsum.photos/seed/begin8/400/600',
    },
    {
      title: 'The Garden Path',
      href: '#',
      author: {
        name: 'Hiroshi Tanabe',
        avatar: 'https://i.pravatar.cc/48?u=hiroshi',
        href: '#',
      },
      genres: ['Zen', 'Contemplative'],
      image: 'https://picsum.photos/seed/begin9/400/600',
    },
    {
      title: 'Raindrop Detective',
      href: '#',
      author: {
        name: 'Lina Kowalski',
        avatar: 'https://i.pravatar.cc/48?u=lina',
        href: '#',
      },
      genres: ["Children's", 'Mystery'],
      image: 'https://picsum.photos/seed/begin10/400/600',
      mark: 'complete' as const,
    },
    {
      title: 'Sunset Rodeo',
      href: '#',
      author: { name: 'Billy Tanner', href: '#' },
      genres: ['Western', 'Comedy'],
      image: 'https://picsum.photos/seed/begin11/400/600',
    },
    {
      title: 'The Brave Little Ship',
      href: '#',
      author: {
        name: 'Nora Svensson',
        avatar: 'https://i.pravatar.cc/48?u=nora',
        href: '#',
      },
      genres: ['Fable', 'Adventure'],
      image: 'https://picsum.photos/seed/begin12/400/600',
    },
    {
      title: 'Recipe for Trouble',
      href: '#',
      author: {
        name: 'Gustavo Peña',
        avatar: 'https://i.pravatar.cc/48?u=gustavo',
        href: '#',
      },
      genres: ['Culinary', 'Humor'],
      image: 'https://picsum.photos/seed/begin13/400/600',
      mark: 'resume' as const,
    },
    {
      title: 'Cloud Shepherd',
      href: '#',
      author: { name: 'CoNexus Team', href: '#' },
      genres: ['Pastoral', 'Whimsical'],
      image: 'https://picsum.photos/seed/begin14/400/600',
    },
    {
      title: 'The Music Box',
      href: '#',
      author: { name: 'Clara Dietrich', href: '#' },
      genres: ['Fairy Tale', 'Musical'],
      image: 'https://picsum.photos/seed/begin15/400/600',
    },
    {
      title: 'Camp Firefly',
      href: '#',
      author: {
        name: 'Jessie Chen',
        avatar: 'https://i.pravatar.cc/48?u=jessie',
        href: '#',
      },
      genres: ['Coming of Age', 'Friendship'],
      image: 'https://picsum.photos/seed/begin16/400/600',
      mark: 'complete' as const,
    },
    {
      title: "A Dragon's Grocery List",
      href: '#',
      author: {
        name: 'Petra Knowles',
        avatar: 'https://i.pravatar.cc/48?u=petra',
        href: '#',
      },
      genres: ['Fantasy', 'Parody'],
      image: 'https://picsum.photos/seed/begin17/400/600',
    },
  ];

  const staffPickStories = [
    {
      title: "The Surgeon's Gambit",
      href: '#',
      author: {
        name: 'Dr. Rania Khalil',
        avatar: 'https://i.pravatar.cc/48?u=rania',
        href: '#',
      },
      genres: ['Medical Thriller', 'Suspense'],
      image: 'https://picsum.photos/seed/staff1/400/600',
    },
    {
      title: 'Iron Harvest',
      href: '#',
      author: {
        name: 'Vasyl Petrov',
        avatar: 'https://i.pravatar.cc/48?u=vasyl',
        href: '#',
      },
      genres: ['Dieselpunk', 'War'],
      image: 'https://picsum.photos/seed/staff2/400/600',
      mark: 'resume' as const,
    },
    {
      title: "Serpent's Cradle",
      href: '#',
      author: { name: 'Marisol Vargas', href: '#' },
      genres: ['Mythology', 'Mesoamerican'],
      image: 'https://picsum.photos/seed/staff3/400/600',
      gated: true,
    },
    {
      title: 'Glass Ceiling',
      href: '#',
      author: {
        name: 'Naomi Xu',
        avatar: 'https://i.pravatar.cc/48?u=naomi',
        href: '#',
      },
      genres: ['Corporate Thriller', 'Satire'],
      image: 'https://picsum.photos/seed/staff4/400/600',
      mark: 'complete' as const,
    },
    {
      title: 'The Vagrant King',
      href: '#',
      author: {
        name: 'Eamon Byrne',
        avatar: 'https://i.pravatar.cc/48?u=eamon',
        href: '#',
      },
      genres: ['Epic Fantasy', 'Tragedy'],
      image: 'https://picsum.photos/seed/staff5/400/600',
      gated: true,
    },
    {
      title: 'Foxfire',
      href: '#',
      author: { name: 'Sakura Inoue', href: '#' },
      genres: ['Japanese Folklore', 'Supernatural'],
      image: 'https://picsum.photos/seed/staff6/400/600',
    },
    {
      title: 'Terminal Velocity',
      href: '#',
      author: {
        name: 'Jake Morrison',
        avatar: 'https://i.pravatar.cc/48?u=jake',
        href: '#',
      },
      genres: ['Action', 'Heist'],
      image: 'https://picsum.photos/seed/staff7/400/600',
      mark: 'replay' as const,
    },
    {
      title: "The Beekeeper's Daughter",
      href: '#',
      author: {
        name: 'Isolde Werner',
        avatar: 'https://i.pravatar.cc/48?u=isolde',
        href: '#',
      },
      genres: ['Literary Fiction', 'Rural'],
      image: 'https://picsum.photos/seed/staff8/400/600',
    },
    {
      title: 'Void Between Stars',
      href: '#',
      author: { name: 'Alexei Volkov', href: '#' },
      genres: ['Hard Sci-Fi', 'Existential'],
      image: 'https://picsum.photos/seed/staff9/400/600',
    },
    {
      title: 'Ink & Bone',
      href: '#',
      author: {
        name: 'Rhiannon Blake',
        avatar: 'https://i.pravatar.cc/48?u=rhiannon',
        href: '#',
      },
      genres: ['Necromancy', 'Dark Academia'],
      image: 'https://picsum.photos/seed/staff10/400/600',
      mark: 'resume' as const,
    },
    {
      title: 'The Long Drift',
      href: '#',
      author: {
        name: 'Dustin Reeves',
        avatar: 'https://i.pravatar.cc/48?u=dustin',
        href: '#',
      },
      genres: ['Solarpunk', 'Utopian'],
      image: 'https://picsum.photos/seed/staff11/400/600',
    },
    {
      title: 'Puppet Parliament',
      href: '#',
      author: { name: 'Cécile Moreau', href: '#' },
      genres: ['Absurdist', 'Political'],
      image: 'https://picsum.photos/seed/staff12/400/600',
    },
    {
      title: 'Salt & Shadow',
      href: '#',
      author: {
        name: 'Omar Farouk',
        avatar: 'https://i.pravatar.cc/48?u=omar',
        href: '#',
      },
      genres: ['Arabian Nights', 'Adventure'],
      image: 'https://picsum.photos/seed/staff13/400/600',
      mark: 'complete' as const,
    },
    {
      title: 'Neurovore',
      href: '#',
      author: {
        name: 'Zane Fischer',
        avatar: 'https://i.pravatar.cc/48?u=zane',
        href: '#',
      },
      genres: ['Body Horror', 'Sci-Fi'],
      image: 'https://picsum.photos/seed/staff14/400/600',
      gated: true,
    },
    {
      title: 'The Seventh Season',
      href: '#',
      author: { name: 'Amara Obi', href: '#' },
      genres: ['Sports Drama', 'Underdog'],
      image: 'https://picsum.photos/seed/staff15/400/600',
    },
    {
      title: 'Labyrinth of Echoes',
      href: '#',
      author: {
        name: 'Dimitri Sokolov',
        avatar: 'https://i.pravatar.cc/48?u=dimitri',
        href: '#',
      },
      genres: ['Surrealism', 'Puzzle'],
      image: 'https://picsum.photos/seed/staff16/400/600',
      mark: 'replay' as const,
    },
    {
      title: 'Wildblood',
      href: '#',
      author: {
        name: 'Kira Stonewall',
        avatar: 'https://i.pravatar.cc/48?u=kira',
        href: '#',
      },
      genres: ['Werewolf', 'Paranormal Romance'],
      image: 'https://picsum.photos/seed/staff17/400/600',
    },
    {
      title: 'The Confession Engine',
      href: '#',
      author: { name: 'Henrik Lund', href: '#' },
      genres: ['Dystopian', 'Philosophical'],
      image: 'https://picsum.photos/seed/staff18/400/600',
    },
    {
      title: 'Monsoon Wedding Heist',
      href: '#',
      author: {
        name: 'Anika Desai',
        avatar: 'https://i.pravatar.cc/48?u=anika',
        href: '#',
      },
      genres: ['Bollywood', 'Caper'],
      image: 'https://picsum.photos/seed/staff19/400/600',
      mark: 'resume' as const,
    },
    {
      title: 'The Last Cartoonist',
      href: '#',
      author: {
        name: 'Benny Cho',
        avatar: 'https://i.pravatar.cc/48?u=benny',
        href: '#',
      },
      genres: ['Metafiction', 'Tragicomedy'],
      image: 'https://picsum.photos/seed/staff20/400/600',
    },
    {
      title: 'Midnight Bazaar',
      href: '#',
      author: {
        name: 'Leila Zamani',
        avatar: 'https://i.pravatar.cc/48?u=leila',
        href: '#',
      },
      genres: ['Magical Realism', 'Persian'],
      image: 'https://picsum.photos/seed/staff21/400/600',
      mark: 'complete' as const,
    },
    {
      title: 'The Vermillion Circuit',
      href: '#',
      author: { name: 'Santiago Ruiz', href: '#' },
      genres: ['Cyberpunk', 'Noir'],
      image: 'https://picsum.photos/seed/staff22/400/600',
    },
    {
      title: 'Kindred Engines',
      href: '#',
      author: {
        name: 'Faye Underwood',
        avatar: 'https://i.pravatar.cc/48?u=faye',
        href: '#',
      },
      genres: ['Steampunk', 'Found Family'],
      image: 'https://picsum.photos/seed/staff23/400/600',
      mark: 'replay' as const,
    },
    {
      title: 'The Paper Menagerie',
      href: '#',
      author: {
        name: 'Jia-Li Wong',
        avatar: 'https://i.pravatar.cc/48?u=jiali',
        href: '#',
      },
      genres: ['Origami Magic', 'Immigrant Story'],
      image: 'https://picsum.photos/seed/staff24/400/600',
      gated: true,
    },
  ];

  const risingStarStories: StoryData[] = [
    {
      title: 'The Rust Belt Siren',
      href: '#',
      author: {
        name: 'Jolene Kaczmarek',
        avatar: 'https://i.pravatar.cc/48?u=jolene',
        href: '#',
      },
      genres: ['Americana', 'Supernatural'],
      image: 'https://picsum.photos/seed/rise1/400/600',
    },
    {
      title: 'Pressure Drop',
      href: '#',
      author: { name: 'Tobias Grant', href: '#' },
      genres: ['Submarine Thriller', 'Claustrophobic'],
      image: 'https://picsum.photos/seed/rise2/400/600',
      mark: 'resume' as const,
    },
    {
      title: 'Daughters of Silt',
      href: '#',
      author: {
        name: 'Amina Diallo',
        avatar: 'https://i.pravatar.cc/48?u=amina',
        href: '#',
      },
      genres: ['West African Fantasy', 'Coming of Age'],
      image: 'https://picsum.photos/seed/rise3/400/600',
    },
    {
      title: 'The Apothecary War',
      href: '#',
      author: {
        name: 'Callum Sheehan',
        avatar: 'https://i.pravatar.cc/48?u=callum',
        href: '#',
      },
      genres: ['Alchemy', 'Low Fantasy'],
      image: 'https://picsum.photos/seed/rise4/400/600',
      gated: true,
    },
    {
      title: 'Frostline',
      href: '#',
      author: { name: 'Vigdís Arnarsdóttir', href: '#' },
      genres: ['Nordic Noir', 'Survival'],
      image: 'https://picsum.photos/seed/rise5/400/600',
      mark: 'complete' as const,
    },
    {
      title: 'Spool',
      href: '#',
      author: {
        name: 'Darcy Lam',
        avatar: 'https://i.pravatar.cc/48?u=darcy',
        href: '#',
      },
      genres: ['Time Loop', 'Romance'],
      image: 'https://picsum.photos/seed/rise6/400/600',
    },
    {
      title: 'Radio Nowhere',
      href: '#',
      author: {
        name: 'Eugene Marsh',
        avatar: 'https://i.pravatar.cc/48?u=eugene',
        href: '#',
      },
      genres: ['Post-Apocalyptic', 'Road Trip'],
      image: 'https://picsum.photos/seed/rise7/400/600',
      mark: 'replay' as const,
    },
    {
      title: 'Silkworm Throne',
      href: '#',
      author: {
        name: 'Wei Lianhua',
        avatar: 'https://i.pravatar.cc/48?u=lianhua',
        href: '#',
      },
      genres: ['Wuxia', 'Court Intrigue'],
      image: 'https://picsum.photos/seed/rise8/400/600',
      gated: true,
    },
    {
      title: 'Bleach & Bloom',
      href: '#',
      author: { name: 'Niamh Callaghan', href: '#' },
      genres: ['Eco-Horror', 'Rural Gothic'],
      image: 'https://picsum.photos/seed/rise9/400/600',
    },
    {
      title: 'The Conductor',
      href: '#',
      author: {
        name: 'Rafael Mendoza',
        avatar: 'https://i.pravatar.cc/48?u=rafael',
        href: '#',
      },
      genres: ['Musical', 'Historical Drama'],
      image: 'https://picsum.photos/seed/rise10/400/600',
      mark: 'resume' as const,
    },
    {
      title: 'Guttersnipe',
      href: '#',
      author: {
        name: 'Phoebe Tsang',
        avatar: 'https://i.pravatar.cc/48?u=phoebe',
        href: '#',
      },
      genres: ['Victorian', 'Street Urchin'],
      image: 'https://picsum.photos/seed/rise11/400/600',
    },
    {
      title: 'The Cartographer of Bones',
      href: '#',
      author: { name: 'Idris Conteh', href: '#' },
      genres: ['Anthropological', 'Mystery'],
      image: 'https://picsum.photos/seed/rise12/400/600',
      mark: 'complete' as const,
    },
    {
      title: 'Venom Season',
      href: '#',
      author: {
        name: 'Luz Esperanza',
        avatar: 'https://i.pravatar.cc/48?u=luz',
        href: '#',
      },
      genres: ['Latin American Gothic', 'Revenge'],
      image: 'https://picsum.photos/seed/rise13/400/600',
    },
    {
      title: 'Ember Atlas',
      href: '#',
      author: {
        name: 'Oscar Lindqvist',
        avatar: 'https://i.pravatar.cc/48?u=oscar',
        href: '#',
      },
      genres: ['Cartography', 'Adventure'],
      image: 'https://picsum.photos/seed/rise14/400/600',
      gated: true,
    },
    {
      title: 'Switchboard',
      href: '#',
      author: {
        name: 'Mae Donovan',
        avatar: 'https://i.pravatar.cc/48?u=mae',
        href: '#',
      },
      genres: ['Cold War', 'Espionage'],
      image: 'https://picsum.photos/seed/rise15/400/600',
    },
    {
      title: 'The Midwife of Monsters',
      href: '#',
      author: { name: 'Bruna Costa', href: '#' },
      genres: ['Dark Fantasy', 'Motherhood'],
      image: 'https://picsum.photos/seed/rise16/400/600',
      mark: 'replay' as const,
    },
    {
      title: 'Tidebreak',
      href: '#',
      author: {
        name: 'Ansel Thorpe',
        avatar: 'https://i.pravatar.cc/48?u=ansel',
        href: '#',
      },
      genres: ['Nautical', 'Supernatural'],
      image: 'https://picsum.photos/seed/rise17/400/600',
    },
    {
      title: 'A Feast of Ashes',
      href: '#',
      author: {
        name: 'Dina Khoury',
        avatar: 'https://i.pravatar.cc/48?u=dina',
        href: '#',
      },
      genres: ['Culinary Noir', 'Family Drama'],
      image: 'https://picsum.photos/seed/rise18/400/600',
      mark: 'resume' as const,
    },
    {
      title: 'Coilspring',
      href: '#',
      author: { name: 'Tadhg Brennan', href: '#' },
      genres: ['Steampunk', 'Rebellion'],
      image: 'https://picsum.photos/seed/rise19/400/600',
    },
  ];

  const worldBuilderStories: StoryData[] = [
    {
      title: 'Ashenmarch',
      href: '#',
      author: {
        name: 'Elara Thorne',
        avatar: 'https://i.pravatar.cc/48?u=elara',
        href: '#',
      },
      genres: ['Epic Fantasy', 'War Chronicle'],
      image: 'https://picsum.photos/seed/world1/400/600',
      mark: 'resume' as const,
    },
    {
      title: 'The Chromatic Rift',
      href: '#',
      author: { name: 'Pascal Ngoma', href: '#' },
      genres: ['Dimensional Travel', 'Sci-Fantasy'],
      image: 'https://picsum.photos/seed/world2/400/600',
    },
    {
      title: 'Terraform',
      href: '#',
      author: {
        name: 'Sven Eriksson',
        avatar: 'https://i.pravatar.cc/48?u=sven',
        href: '#',
      },
      genres: ['Hard Sci-Fi', 'Colonization'],
      image: 'https://picsum.photos/seed/world3/400/600',
      gated: true,
    },
    {
      title: 'The Broken Concordance',
      href: '#',
      author: {
        name: 'Miriam Alcázar',
        avatar: 'https://i.pravatar.cc/48?u=miriam',
        href: '#',
      },
      genres: ['Political Fantasy', 'Diplomacy'],
      image: 'https://picsum.photos/seed/world4/400/600',
      mark: 'complete' as const,
    },
    {
      title: 'Pelagic',
      href: '#',
      author: { name: 'Ondrej Havel', href: '#' },
      genres: ['Underwater Civilization', 'Sci-Fi'],
      image: 'https://picsum.photos/seed/world5/400/600',
    },
    {
      title: 'The Crucible Lands',
      href: '#',
      author: {
        name: 'Aderyn Cooke',
        avatar: 'https://i.pravatar.cc/48?u=aderyn',
        href: '#',
      },
      genres: ['Grimdark', 'Survival'],
      image: 'https://picsum.photos/seed/world6/400/600',
      mark: 'replay' as const,
    },
    {
      title: 'Cascade Protocol',
      href: '#',
      author: {
        name: 'Yuna Kim',
        avatar: 'https://i.pravatar.cc/48?u=yuna',
        href: '#',
      },
      genres: ['Space Opera', 'AI Rebellion'],
      image: 'https://picsum.photos/seed/world7/400/600',
    },
    {
      title: 'Root & Ruin',
      href: '#',
      author: { name: 'Fintan McCarthy', href: '#' },
      genres: ['Mycelial Network', 'Bio-Fantasy'],
      image: 'https://picsum.photos/seed/world8/400/600',
      gated: true,
    },
    {
      title: 'The Sovereignty Engine',
      href: '#',
      author: {
        name: 'Nadia Volkov',
        avatar: 'https://i.pravatar.cc/48?u=nadia',
        href: '#',
      },
      genres: ['Magitech', 'Empire Building'],
      image: 'https://picsum.photos/seed/world9/400/600',
      mark: 'resume' as const,
    },
    {
      title: 'Titanfall Sonata',
      href: '#',
      author: {
        name: 'Hector Salinas',
        avatar: 'https://i.pravatar.cc/48?u=hector',
        href: '#',
      },
      genres: ['Mecha', 'Opera'],
      image: 'https://picsum.photos/seed/world10/400/600',
    },
    {
      title: 'The Wandering Caliphate',
      href: '#',
      author: { name: 'Farid Al-Rashid', href: '#' },
      genres: ['Desert Fantasy', 'Nomadic'],
      image: 'https://picsum.photos/seed/world11/400/600',
      mark: 'complete' as const,
    },
    {
      title: 'Spore',
      href: '#',
      author: {
        name: 'Iris Nakagawa',
        avatar: 'https://i.pravatar.cc/48?u=iris',
        href: '#',
      },
      genres: ['Biopunk', 'Fungal Horror'],
      image: 'https://picsum.photos/seed/world12/400/600',
    },
    {
      title: 'The Infinite Library',
      href: '#',
      author: {
        name: 'Benedict Harrow',
        avatar: 'https://i.pravatar.cc/48?u=benedict',
        href: '#',
      },
      genres: ['Borges-Inspired', 'Puzzle'],
      image: 'https://picsum.photos/seed/world13/400/600',
      mark: 'replay' as const,
    },
    {
      title: 'Hearthstone Vigil',
      href: '#',
      author: { name: 'Siobhán Walsh', href: '#' },
      genres: ['Celtic Fantasy', 'Druidic'],
      image: 'https://picsum.photos/seed/world14/400/600',
    },
    {
      title: 'The Graviton Cage',
      href: '#',
      author: {
        name: 'Konstantin Zaytsev',
        avatar: 'https://i.pravatar.cc/48?u=konstantin',
        href: '#',
      },
      genres: ['Physics Fiction', 'Space Station'],
      image: 'https://picsum.photos/seed/world15/400/600',
      gated: true,
    },
    {
      title: 'Obsidian Tide',
      href: '#',
      author: {
        name: 'Moana Teʻo',
        avatar: 'https://i.pravatar.cc/48?u=moana',
        href: '#',
      },
      genres: ['Polynesian Mythology', 'Oceanic'],
      image: 'https://picsum.photos/seed/world16/400/600',
      mark: 'resume' as const,
    },
    {
      title: 'Axiom',
      href: '#',
      author: { name: 'Lars Henriksen', href: '#' },
      genres: ['Mathematical', 'Philosophical Sci-Fi'],
      image: 'https://picsum.photos/seed/world17/400/600',
    },
    {
      title: 'The Loom of Ages',
      href: '#',
      author: {
        name: 'Freya Blackwood',
        avatar: 'https://i.pravatar.cc/48?u=freya',
        href: '#',
      },
      genres: ['Time-Weaving', 'Multi-Era'],
      image: 'https://picsum.photos/seed/world18/400/600',
      mark: 'complete' as const,
    },
    {
      title: 'Canopy',
      href: '#',
      author: {
        name: 'Zuri Mwangi',
        avatar: 'https://i.pravatar.cc/48?u=zuri',
        href: '#',
      },
      genres: ['Arboreal Civilization', 'Solarpunk'],
      image: 'https://picsum.photos/seed/world19/400/600',
    },
    {
      title: 'The Bone Cartographers',
      href: '#',
      author: { name: 'Esmé Delaney', href: '#' },
      genres: ['Necromancy', 'Exploration'],
      image: 'https://picsum.photos/seed/world20/400/600',
      mark: 'replay' as const,
      gated: true,
    },
    {
      title: 'Ferrous',
      href: '#',
      author: {
        name: 'Gunnar Ólafsson',
        avatar: 'https://i.pravatar.cc/48?u=gunnar',
        href: '#',
      },
      genres: ['Dwarven', 'Industrial Fantasy'],
      image: 'https://picsum.photos/seed/world21/400/600',
    },
  ];

  // ── Reorder showcase data ──────────────────────────────────────────────
  // Two reorderable tile categories rendered below the main paginated feed.
  // Tiles can be reordered within a category and dragged between the two.
  //
  // DATA MODEL:
  // ReorderTile extends StoryData with a required `id` field. The `id` is
  // the stable identity used by the drag system for tracking, keyed lists,
  // and FLIP animations. In production, this maps to the story's database ID.
  //
  // BACKEND INTEGRATION:
  // 1. Replace `initialQueueStories` / `initialWatchLaterStories` with data
  //    fetched from your API (e.g., GET /api/user/queue, GET /api/user/watch-later).
  // 2. In `handleReorderDrop`, after calling `setZone(...)`, persist the new
  //    order to the backend. Use `resolveReorderByDrop` (from @actions/drag)
  //    instead of `reorderByDrop` to get a `ReorderRequest` payload with
  //    `id`, `targetId`, `position`, `fromIndex`, `toIndex`, `previousId`,
  //    `nextId`, and `orderedIds` — ready for a PATCH/PUT endpoint.
  //    Example:
  //      const { items, request } = resolveReorderByDrop(getZone(zone), detail);
  //      setZone(zone, items);
  //      await api.reorder(zoneEndpoint, request);
  // 3. For cross-zone transfers, send both the removal from the source zone
  //    and the insertion into the target zone as a single transaction.
  // 4. The `moveReorderTile` button handler also uses `reorderByDrop` —
  //    swap to `resolveReorderByDrop` for the same backend payload.
  //
  // ARCHITECTURE:
  // - Each category is wrapped in a zone-level `use:dropTarget` (mode: 'inside')
  //   so empty categories can still accept drops.
  // - Each tile wrapper is both `use:draggable` and `use:dropTarget`
  //   (mode: 'between', axis: 'horizontal') for insertion ordering.
  // - `handle: '[data-drag-handle]'` restricts drag initiation to the grip
  //   icon, preventing conflict with the tile's stretched link.
  // - `animate:live` on each wrapper provides FLIP reflow animation.
  //
  // @see /src/actions/drag.ts — draggable, dropTarget, reorderByDrop, resolveReorderByDrop
  // @see /src/components/ui-library/DragAndDrop.svelte — kanban zone pattern reference
  // @see /src/styles/components/_tiles.scss — Section 6 (tile-reorder styles)
  // @see /src/styles/components/_drag.scss — horizontal drop indicators

  interface ReorderTile extends StoryData {
    id: string;
  }

  const initialQueueStories: ReorderTile[] = [
    {
      id: 'q1',
      title: 'Iron Meridian',
      href: '#',
      author: {
        name: 'Viktor Hale',
        avatar: 'https://i.pravatar.cc/48?u=viktor',
        href: '#',
      },
      genres: ['Military Sci-Fi', 'Strategy'],
      image: 'https://picsum.photos/seed/queue1/400/600',
      mark: 'resume' as const,
    },
    {
      id: 'q2',
      title: 'Gossamer Thread',
      href: '#',
      author: { name: 'Mei Lin', href: '#' },
      genres: ['Fairy Tale', 'Dark Fantasy'],
      image: 'https://picsum.photos/seed/queue2/400/600',
    },
    {
      id: 'q3',
      title: 'Salt & Circuit',
      href: '#',
      author: {
        name: 'Joaquin Torres',
        avatar: 'https://i.pravatar.cc/48?u=joaquin',
        href: '#',
      },
      genres: ['Cyberpunk', 'Culinary'],
      image: 'https://picsum.photos/seed/queue3/400/600',
      gated: true,
    },
    {
      id: 'q4',
      title: 'The Ember Choir',
      href: '#',
      author: {
        name: 'Saoirse Flynn',
        avatar: 'https://i.pravatar.cc/48?u=saoirse',
        href: '#',
      },
      genres: ['Musical', 'Post-Apocalyptic'],
      image: 'https://picsum.photos/seed/queue4/400/600',
    },
    {
      id: 'q5',
      title: 'Nightjar',
      href: '#',
      author: { name: 'Oleg Petrov', href: '#' },
      genres: ['Espionage', 'Cold War'],
      image: 'https://picsum.photos/seed/queue5/400/600',
      mark: 'complete' as const,
    },
    {
      id: 'q6',
      title: 'Abyssal Crown',
      href: '#',
      author: {
        name: 'Thalassa Neri',
        avatar: 'https://i.pravatar.cc/48?u=thalassa',
        href: '#',
      },
      genres: ['Underwater', 'Epic Fantasy'],
      image: 'https://picsum.photos/seed/queue6/400/600',
    },
  ];

  const initialWatchLaterStories: ReorderTile[] = [
    {
      id: 'wl1',
      title: 'Rust & Reverie',
      href: '#',
      author: {
        name: 'Cassidy Wren',
        avatar: 'https://i.pravatar.cc/48?u=cassidy',
        href: '#',
      },
      genres: ['Steampunk', 'Romance'],
      image: 'https://picsum.photos/seed/later1/400/600',
    },
    {
      id: 'wl2',
      title: 'The Glass Menagerie',
      href: '#',
      author: { name: 'Dorian Ashby', href: '#' },
      genres: ['Gothic', 'Mystery'],
      image: 'https://picsum.photos/seed/later2/400/600',
      mark: 'replay' as const,
    },
    {
      id: 'wl3',
      title: 'Parallax',
      href: '#',
      author: {
        name: 'Yuna Nakashima',
        avatar: 'https://i.pravatar.cc/48?u=yuna',
        href: '#',
      },
      genres: ['Hard Sci-Fi', 'Philosophical'],
      image: 'https://picsum.photos/seed/later3/400/600',
      gated: true,
    },
    {
      id: 'wl4',
      title: 'Kindling',
      href: '#',
      author: {
        name: 'Rowan Blackthorn',
        avatar: 'https://i.pravatar.cc/48?u=rowan',
        href: '#',
      },
      genres: ['Survival', 'Coming of Age'],
      image: 'https://picsum.photos/seed/later4/400/600',
      mark: 'resume' as const,
    },
    {
      id: 'wl5',
      title: 'The Onyx Archive',
      href: '#',
      author: { name: 'Ezra Whitlock', href: '#' },
      genres: ['Lovecraftian', 'Library Fantasy'],
      image: 'https://picsum.photos/seed/later5/400/600',
    },
    {
      id: 'wl6',
      title: 'Vermillion Sky',
      href: '#',
      author: {
        name: 'Amara Diallo',
        avatar: 'https://i.pravatar.cc/48?u=amara',
        href: '#',
      },
      genres: ['Afrofuturism', 'Space Opera'],
      image: 'https://picsum.photos/seed/later6/400/600',
    },
  ];

  // ── Reorder state management ────────────────────────────────────────────
  // Two reactive arrays — one per zone. All mutations produce new arrays
  // (immutable updates) so Svelte 5 reactivity picks up changes.
  //
  // FUNCTIONS:
  // - findTileZone(id)          → which zone ('queue' | 'watchLater') owns this tile
  // - getZone(zone) / setZone   → read/write zone array by key
  // - handleReorderDrop(detail) → unified drop handler for both zones
  //     • detail.position 'before'|'after' → tile-on-tile drop (reorder or cross-zone)
  //     • detail.position undefined        → zone-container drop (transfer + append)
  // - moveReorderTile(zone, id, direction) → button-based within-row reorder only
  //     • direction -1 = move left, +1 = move right
  //     • Disabled at boundaries (first tile can't go left, last can't go right)
  //     • Does NOT cross zones — drag handles cross-zone transfers
  // - resetReorderZones()       → restore both zones to initial demo data

  let queueStories = $state<ReorderTile[]>([...initialQueueStories]);
  let watchLaterStories = $state<ReorderTile[]>([...initialWatchLaterStories]);

  function findTileZone(tileId: string): 'queue' | 'watchLater' | null {
    if (queueStories.some((s) => s.id === tileId)) return 'queue';
    if (watchLaterStories.some((s) => s.id === tileId)) return 'watchLater';
    return null;
  }

  function getZone(zone: 'queue' | 'watchLater'): ReorderTile[] {
    return zone === 'queue' ? queueStories : watchLaterStories;
  }

  function setZone(zone: 'queue' | 'watchLater', items: ReorderTile[]): void {
    if (zone === 'queue') queueStories = items;
    else watchLaterStories = items;
  }

  function handleReorderDrop(detail: DropDetail): void {
    const tile = detail.data as ReorderTile;
    const sourceZone = findTileZone(tile.id);
    if (!sourceZone) return;

    if (detail.position === 'before' || detail.position === 'after') {
      // Dropped on another tile — reorder or cross-zone insert
      const targetZone = findTileZone(detail.targetId!);
      if (!targetZone) return;

      if (sourceZone === targetZone) {
        setZone(targetZone, reorderByDrop(getZone(targetZone), detail));
      } else {
        // Cross-zone: remove from source, insert at position in target
        const sourceItems = getZone(sourceZone).filter((s) => s.id !== tile.id);
        setZone(sourceZone, sourceItems);

        const targetItems = [...getZone(targetZone)];
        const targetIndex = targetItems.findIndex(
          (s) => s.id === detail.targetId,
        );
        const insertAt =
          targetIndex === -1
            ? targetItems.length
            : detail.position === 'after'
              ? targetIndex + 1
              : targetIndex;
        targetItems.splice(insertAt, 0, tile);
        setZone(targetZone, targetItems);
      }
    } else {
      // Dropped on zone container (mode: 'inside') — transfer and append
      const targetZone =
        detail.targetId === 'reorder-queue' ? 'queue' : 'watchLater';
      if (sourceZone === targetZone) return;
      setZone(
        sourceZone,
        getZone(sourceZone).filter((s) => s.id !== tile.id),
      );
      setZone(targetZone, [...getZone(targetZone), tile]);
    }
  }

  function moveReorderTile(
    zone: 'queue' | 'watchLater',
    tileId: string,
    direction: -1 | 1,
  ): void {
    const items = getZone(zone);
    const fromIndex = items.findIndex((s) => s.id === tileId);
    if (fromIndex === -1) return;

    const toIndex = fromIndex + direction;
    if (toIndex < 0 || toIndex >= items.length) return;

    const targetId = items[toIndex]?.id;
    if (!targetId) return;

    setZone(
      zone,
      reorderByDrop(items, {
        id: tileId,
        targetId,
        position: direction > 0 ? 'after' : 'before',
      }),
    );
  }

  function resetReorderZones(): void {
    queueStories = [...initialQueueStories];
    watchLaterStories = [...initialWatchLaterStories];
  }

  // ── Feed assembly ──────────────────────────────────────────────────────

  const allCategories: CategoryDef[] = [
    {
      id: 'hottest',
      title: 'Hottest right now',
      tagline: 'Most played this week.',
      stories: hottestStories,
    },
    {
      id: 'beginner',
      title: 'Getting Started',
      tagline: 'Short, beginner-friendly journeys.',
      stories: beginnerStories,
    },
    {
      id: 'staff-picks',
      title: 'Staff Picks',
      tagline: 'Hand-curated by the CoNexus editorial team.',
      stories: staffPickStories,
    },
    {
      id: 'rising-stars',
      title: 'Rising Stars',
      tagline: 'Breakout hits from indie authors.',
      stories: risingStarStories,
    },
    {
      id: 'world-builders',
      title: 'World Builders',
      tagline: 'Immersive universes and epic sagas.',
      stories: worldBuilderStories,
    },
  ];

  const feed = createPaginatedFeed(allCategories);

  // Gate auto-observation until the user has actually scrolled the page.
  // Prevents the LoadMore sentinel from firing on first paint on tall viewports
  // where only 2 categories leave the sentinel in the initial viewport.
  let userHasScrolled = $state(false);

  $effect(() => {
    function onScroll() {
      userHasScrolled = true;
      window.removeEventListener('scroll', onScroll);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  });
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<PullRefresh onrefresh={handleRefresh} onerror={handleRefreshError}>
  <div
    class="flex flex-col gap-xl pt-2xl"
    onclick={interceptDemoLink}
    onkeydown={interceptDemoLink}
  >
    {#each feed.categories as cat (cat.id)}
      <div in:emerge out:dissolve>
        {#if cat.status === 'loading'}
          <div class="story-category" aria-hidden="true">
            <div class="story-category-header">
              <div class="flex flex-col gap-xs flex-1">
                <Skeleton variant="text" width="40%" />
                <Skeleton variant="text" width="60%" />
              </div>
            </div>
            <div class="story-category-strip">
              {#each Array(TILE_INITIAL_SIZE) as _, i (i)}
                <Tile loading />
              {/each}
            </div>
          </div>
        {:else}
          <StoryCategory
            title={cat.title}
            tagline={cat.tagline}
            loading={cat.paginator.loading}
            hasMore={cat.paginator.hasMore}
            onloadmore={cat.paginator.loadMore}
          >
            {#each cat.paginator.visible as story (story.title)}
              <Tile
                title={story.title}
                href={story.href}
                author={story.author}
                genres={story.genres}
                image={story.image}
                mark={story.mark}
                gated={story.gated}
              />
            {/each}
          </StoryCategory>
        {/if}
      </div>
    {/each}

    <LoadMore
      loading={feed.loading}
      hasMore={feed.hasMore}
      onloadmore={feed.loadMore}
      observer={userHasScrolled}
      class="hidden"
    />

    <hr />

    <!-- ─── REORDER SHOWCASE ──────────────────────────────────────────── -->
    <!-- Gated on !feed.hasMore — only renders after all 5 normal feed    -->
    <!-- categories have loaded. Two categories with reorderable tiles.   -->
    <!--                                                                   -->
    <!-- STRUCTURE (per zone):                                             -->
    <!--   div[use:dropTarget mode:'inside'] ← zone-level, accepts empty   -->
    <!--     └ StoryCategory                 ← standard strip + nav        -->
    <!--         └ div.tile-reorder[use:draggable + use:dropTarget]         -->
    <!--             ├ <Tile />              ← standard tile component      -->
    <!--             └ div.tile-reorder-bar  ← ⠿ grip ... [◀] [▶]         -->
    <!--                                                                   -->
    <!-- INTERACTIONS:                                                      -->
    <!-- • Drag from grip handle → reorder within row or transfer to other -->
    <!-- • Left/right buttons → reorder within current row only            -->
    <!-- • Keyboard DnD (Enter→pick, arrows→cycle, Enter→drop) → cross-row -->
    <!-- • Empty zone shows "Drop stories here" placeholder                -->
    <div class="flex flex-col gap-xs px-md">
      <h3 class="text-dim">Reorder Showcase</h3>
      <p class="text-small text-mute">
        Drag tiles between these two categories or use the arrow buttons to
        reorder. Each tile's addon bar provides a drag handle and move controls.
      </p>
      <div class="pt-xs">
        <ActionBtn
          icon={Restart}
          text="Reset"
          size="sm"
          onclick={resetReorderZones}
        />
      </div>
    </div>

    <!-- Zone A: Your Queue -->
    <div
      aria-label="Your Queue reorder zone"
      use:dropTarget={{
        id: 'reorder-queue',
        group: 'reorder',
        onDrop: handleReorderDrop,
      }}
    >
      <StoryCategory title="Your Queue" tagline="Stories you're reading next.">
        {#each queueStories as story, index (story.id)}
          <div
            class="tile-reorder"
            aria-label={story.title}
            use:draggable={{
              id: story.id,
              group: 'reorder',
              data: story,
              handle: '[data-drag-handle]',
            }}
            use:dropTarget={{
              id: story.id,
              group: 'reorder',
              mode: 'between',
              axis: 'horizontal',
              onDrop: handleReorderDrop,
            }}
            animate:live
          >
            <Tile
              title={story.title}
              href={story.href}
              author={story.author}
              genres={story.genres}
              image={story.image}
              mark={story.mark}
              gated={story.gated}
            />
            <div class="tile-reorder-bar">
              <button
                class="btn-icon"
                type="button"
                data-drag-handle
                aria-label={`Drag ${story.title}`}
                title={`Drag ${story.title}`}
              >
                <GripVertical class="icon" data-size="sm" />
              </button>

              <div class="inline-flex items-center gap-xs">
                <button
                  class="btn-icon"
                  type="button"
                  aria-label={`Move ${story.title} left`}
                  title={`Move ${story.title} left`}
                  onclick={() => moveReorderTile('queue', story.id, -1)}
                  disabled={index === 0}
                >
                  <ChevronLeft class="icon" data-size="sm" />
                </button>

                <button
                  class="btn-icon"
                  type="button"
                  aria-label={`Move ${story.title} right`}
                  title={`Move ${story.title} right`}
                  onclick={() => moveReorderTile('queue', story.id, 1)}
                  disabled={index === queueStories.length - 1}
                >
                  <ChevronRight class="icon" data-size="sm" />
                </button>
              </div>
            </div>
          </div>
        {/each}

        {#if queueStories.length === 0}
          <p class="text-mute text-center p-lg">
            Drop stories here
          </p>
        {/if}
      </StoryCategory>
    </div>

    <!-- Zone B: Watch Later -->
    <div
      aria-label="Watch Later reorder zone"
      use:dropTarget={{
        id: 'reorder-watch-later',
        group: 'reorder',
        onDrop: handleReorderDrop,
      }}
    >
      <StoryCategory title="Watch Later" tagline="Saved for another time.">
        {#each watchLaterStories as story, index (story.id)}
          <div
            class="tile-reorder"
            aria-label={story.title}
            use:draggable={{
              id: story.id,
              group: 'reorder',
              data: story,
              handle: '[data-drag-handle]',
            }}
            use:dropTarget={{
              id: story.id,
              group: 'reorder',
              mode: 'between',
              axis: 'horizontal',
              onDrop: handleReorderDrop,
            }}
            animate:live
          >
            <Tile
              title={story.title}
              href={story.href}
              author={story.author}
              genres={story.genres}
              image={story.image}
              mark={story.mark}
              gated={story.gated}
            />
            <div class="tile-reorder-bar">
              <button
                class="btn-icon"
                type="button"
                data-drag-handle
                aria-label={`Drag ${story.title}`}
                title={`Drag ${story.title}`}
              >
                <GripVertical class="icon" data-size="sm" />
              </button>

              <div class="inline-flex items-center gap-xs">
                <button
                  class="btn-icon"
                  type="button"
                  aria-label={`Move ${story.title} left`}
                  title={`Move ${story.title} left`}
                  onclick={() => moveReorderTile('watchLater', story.id, -1)}
                  disabled={index === 0}
                >
                  <ChevronLeft class="icon" data-size="sm" />
                </button>

                <button
                  class="btn-icon"
                  type="button"
                  aria-label={`Move ${story.title} right`}
                  title={`Move ${story.title} right`}
                  onclick={() => moveReorderTile('watchLater', story.id, 1)}
                  disabled={index === watchLaterStories.length - 1}
                >
                  <ChevronRight class="icon" data-size="sm" />
                </button>
              </div>
            </div>
          </div>
        {/each}

        {#if watchLaterStories.length === 0}
          <p class="text-mute text-center p-lg">
            Drop stories here
          </p>
        {/if}
      </StoryCategory>
    </div>
  </div>

  <hr />

  <div class="container py-2xl">
    <div class="flex flex-col gap-2xl">
      <!-- ─── PORTAL LOADER ─────────────────────────────────────────── -->
      <div class="flex flex-col gap-sm border-l-2 border-primary pl-md">
        <h3 class="text-dim">Portal Loader</h3>
        <p class="text-small text-mute">
          The animated loading screen for CoNexus story worlds.
        </p>
      </div>

      <div class="surface-raised p-lg flex flex-col gap-lg">
        <details>
          <summary>Technical Details</summary>
          <div class="p-md flex flex-col gap-md">
            <p>
              The portal is a 4-layer absolute stack: a circuit-board texture at
              5% opacity, a vignette overlay at 50% opacity, an SVG circuitry
              layer with draw-on path animation, and a centered quill icon. All
              layers fill the same <code>aspect-ratio: 2048/1228</code>
              container with responsive max-width scaling up to
              <code>1024px</code>.
            </p>
            <p>
              <strong>LoadingPortal</strong> renders 4 staggered path groups (<code
                >.draw-a</code
              >
              through <code>.draw-d</code>) using
              <code>stroke-dasharray</code>/<code>stroke-dashoffset</code>
              animation on a 6s draw cycle with 1.5s stagger between groups. The
              entire circuitry rotates 360&deg; over 120s.
            </p>
            <p>
              <strong>LoadingQuill</strong> cycles a 3s lifecycle: the stroke traces
              the quill outline, the body fill fades in with a scale pulse, and an
              accent dot levitates from the pen tip before being absorbed back. A
              gentle breath translation keeps the whole quill alive.
            </p>
            <p>
              Two states control the animation:
              <code>idle</code> (frozen, dimmed) and
              <code>loading</code> (animated).
            </p>
          </div>
        </details>

        <div class="flex flex-col gap-sm items-center">
          <p class="text-small text-mute">
            Toggle between <code>idle</code> and <code>loading</code> states. In
            idle, all layers freeze and dim. In loading, circuitry paths draw on
            in staggered waves while the quill cycles its trace&ndash;fill&ndash;absorb
            animation.
          </p>

          <PortalLoader status={portalStatus} />
          <button
            class="btn-ghost"
            onclick={() =>
              (portalStatus = portalStatus === 'loading' ? 'idle' : 'loading')}
          >
            {portalStatus === 'loading' ? 'Stop' : 'Start'}
          </button>

          <p class="text-caption text-mute px-xs">
            The loader fills its container width, scaling from <code>640px</code
            >
            at tablet to <code>1024px</code> at full-HD. Pass
            <code>status="idle"</code> to hold the portal in a dormant state, or
            <code>status="loading"</code> to activate all animations.
          </p>
        </div>
      </div>
    </div>
  </div>
</PullRefresh>

<style lang="scss">
  :global(.portal-ring-demo) {
    width: 100%;
    max-width: 480px; // void-ignore
  }
</style>
