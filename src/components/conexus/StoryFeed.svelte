<script lang="ts">
  import Tile from '../../../packages/dgrs/src/components/Tile.svelte';
  import StoryCategory from '../../../packages/dgrs/src/components/StoryCategory.svelte';
  import LoadMore from '@components/ui/LoadMore.svelte';
  import Skeleton from '@components/ui/Skeleton.svelte';
  import { emerge, dissolve } from '@lib/transitions.svelte';

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
  const hottestStories: StoryData[] = [
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
      mark: 'completed' as const,
      gate: [{ type: 'nft-collection', name: 'Potentials' }],
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
      gate: [{ type: 'fungible', token: 'SOL', amount: 50 }],
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
      gate: [{ type: 'nft-id', collection: 'Mad Lads', ids: ['4521'] }],
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
      mark: 'completed' as const,
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
      mark: 'completed' as const,
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
      gate: [{ type: 'nft-collection', name: 'DeGods' }],
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
      gate: [{ type: 'fungible', token: 'BONK', amount: 50000 }],
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

  const beginnerStories: StoryData[] = [
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
      mark: 'completed' as const,
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
      gate: [{ type: 'nft-collection', name: 'Potentials' }],
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
      mark: 'completed' as const,
    },
    {
      title: 'Pixel Quest',
      href: '#',
      author: { name: 'CoNexus Team', href: '#' },
      genres: ['Comedy', 'Meta'],
      image: 'https://picsum.photos/seed/begin7/400/600',
      gate: [{ type: 'fungible', token: 'USDC', amount: 5 }],
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
      mark: 'completed' as const,
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
      mark: 'completed' as const,
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

  const staffPickStories: StoryData[] = [
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
      gate: [
        {
          type: 'nft-id',
          collection: 'Potentials',
          ids: ['127', '340'],
        },
      ],
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
      mark: 'completed' as const,
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
      gate: [{ type: 'nft-collection', name: 'Claynosaurz' }],
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
      mark: 'completed' as const,
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
      gate: [{ type: 'fungible', token: 'SOL', amount: 10 }],
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
      mark: 'completed' as const,
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
      gate: [{ type: 'nft-collection', name: 'Mad Lads' }],
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
      gate: [{ type: 'nft-id', collection: 'DeGods', ids: ['8834'] }],
    },
    {
      title: 'Frostline',
      href: '#',
      author: { name: 'Vigdís Arnarsdóttir', href: '#' },
      genres: ['Nordic Noir', 'Survival'],
      image: 'https://picsum.photos/seed/rise5/400/600',
      mark: 'completed' as const,
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
      gate: [{ type: 'fungible', token: 'BONK', amount: 100000 }],
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
      mark: 'completed' as const,
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
      gate: [{ type: 'nft-collection', name: 'Potentials' }],
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
      gate: [{ type: 'fungible', token: 'SOL', amount: 25 }],
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
      mark: 'completed' as const,
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
      gate: [{ type: 'nft-collection', name: 'Tensorians' }],
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
      mark: 'completed' as const,
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
      gate: [
        {
          type: 'nft-id',
          collection: 'Potentials',
          ids: ['501', '502', '503'],
        },
      ],
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
      mark: 'completed' as const,
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
      gate: [{ type: 'fungible', token: 'USDC', amount: 10 }],
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

  // ── Feed assembly ──────────────────────────────────────────────────────
  const allCategories: CategoryDef[] = [
    {
      id: 'hottest',
      title: 'Hottest Stories',
      tagline: 'The community is obsessed with these right now.',
      stories: hottestStories,
    },
    {
      id: 'beginner',
      title: 'Beginner Friendly',
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
            gate={story.gate}
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
