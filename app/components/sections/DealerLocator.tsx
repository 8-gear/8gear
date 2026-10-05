"use client";

/* eslint-disable react-hooks/refs -- Floating UI's supported API exposes callback refs through refs.setReference/setFloating. */

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { MapPin, Search } from "lucide-react";
import {
  Map as PigeonMap,
  Overlay,
  ZoomControl,
} from "pigeon-maps";
import {
  autoUpdate,
  arrow,
  flip,
  FloatingArrow,
  FloatingPortal,
  offset,
  shift,
  useFloating,
} from "@floating-ui/react";

/* ============================================================
   TYPES
============================================================ */

type Dealer = {
  id: number;
  name: string;
  address: string;
  mapQuery: string;
};

type Coordinates = [number, number];

type DealerPoint = {
  dealer: Dealer;
  coordinate: Coordinates;
};

type DealerCluster = {
  id: string;
  coordinate: Coordinates;
  dealers: Dealer[];
};

/* ============================================================
   DEALERS
============================================================ */

const dealers: Dealer[] = [
  {
    id: 1,
    name: "Laval MOTO Inc",
    address: "315 Bd Cartier O, Laval, QC H7N 2J3",
    mapQuery: "315 Bd Cartier O, Laval, QC H7N 2J3, Canada",
  },
  {
    id: 2,
    name: "Motos Illimitées",
    address: "3250 Bd des Entreprises, Terrebonne, QC J6X 4J8",
    mapQuery:
      "3250 Bd des Entreprises, Terrebonne, QC J6X 4J8, Canada",
  },
  {
    id: 3,
    name: "Valley Moto Sport",
    address: "1195 Industrial Rd, West Kelowna, BC V1Z 1G4",
    mapQuery: "1195 Industrial Rd, West Kelowna, BC V1Z 1G4, Canada",
  },
  {
    id: 4,
    name: "ADM Sports Quebec",
    address: "1884 Boulevard Wilfrid-Hamel, Quebec, QC G1N 3Z2",
    mapQuery:
      "1884 Boulevard Wilfrid-Hamel, Quebec City, QC G1N 3Z2, Canada",
  },
  {
    id: 5,
    name: "ADM Sports Levi's",
    address: "625 Rte du Président-Kennedy, Lévis, QC G6C 1K1",
    mapQuery:
      "625 Route du Président-Kennedy, Lévis, QC G6C 1K1, Canada",
  },
  // {
  //   id: 6,
  //   name: "8-Gear Canada",
  //   address: "50 Biggar Ave, Hamilton, ON L8L 3Z4 Canada",
  //   mapQuery: "50 Biggar Ave, Hamilton, ON L8L 3Z4, Canada",
  // },
  // {
  //   id: 7,
  //   name: "Sceprio Tex",
  //   address: "455 GG, St 22, P4, DHA, Lahore",
  //   mapQuery: "455 GG, Street 22, Phase 4, DHA, Lahore, Pakistan",
  // },
  {
    id: 8,
    name: "TripleClamp Moto",
    address: "811 Alness St, Toronto, ON M3J 2H8 Canada",
    mapQuery: "811 Alness St, North York, ON M3J 2H8, Canada",
  },
  {
    id: 9,
    name: "Holeshot Motorsports",
    address: "8867 201 St, Langley Twp, BC V2Y 0C8 Canada",
    mapQuery:
      "8867 201 St, Langley Township, BC V2Y 0C8, Canada",
  },
];

const CACHE_KEY = "8gears-dealer-coordinates-v2";

/* ============================================================
   LAT / LNG → PIXEL
============================================================ */

function latLngToPixel(
  coordinate: Coordinates,
  zoom: number
) {
  const [lat, lng] = coordinate;

  const worldSize = 256 * Math.pow(2, zoom);

  const x = ((lng + 180) / 360) * worldSize;

  const sinLatitude = Math.min(
    Math.max(
      Math.sin((lat * Math.PI) / 180),
      -0.9999
    ),
    0.9999
  );

  const y =
    (0.5 -
      Math.log(
        (1 + sinLatitude) /
          (1 - sinLatitude)
      ) /
        (4 * Math.PI)) *
    worldSize;

  return {
    x,
    y,
  };
}

/* ============================================================
   CREATE CLUSTERS
============================================================ */

function createClusters(
  points: DealerPoint[],
  zoom: number
): DealerCluster[] {
  if (points.length === 0) {
    return [];
  }

  let clusterRadius = 72;

  if (zoom <= 3) {
    clusterRadius = 125;
  } else if (zoom <= 5) {
    clusterRadius = 100;
  } else if (zoom <= 7) {
    clusterRadius = 82;
  }

  if (zoom >= 11) {
    return points.map(({ dealer, coordinate }) => ({
      id: `dealer-${dealer.id}`,
      coordinate,
      dealers: [dealer],
    }));
  }

  const remaining = [...points];
  const clusters: DealerCluster[] = [];

  while (remaining.length > 0) {
    const first = remaining.shift();

    if (!first) break;

    const firstPixel = latLngToPixel(
      first.coordinate,
      zoom
    );

    const grouped: DealerPoint[] = [first];

    for (
      let index = remaining.length - 1;
      index >= 0;
      index--
    ) {
      const candidate = remaining[index];

      const candidatePixel = latLngToPixel(
        candidate.coordinate,
        zoom
      );

      const deltaX =
        candidatePixel.x - firstPixel.x;

      const deltaY =
        candidatePixel.y - firstPixel.y;

      const distance = Math.sqrt(
        deltaX * deltaX +
          deltaY * deltaY
      );

      if (distance <= clusterRadius) {
        grouped.push(candidate);
        remaining.splice(index, 1);
      }
    }

    const averageLat =
      grouped.reduce(
        (total, item) =>
          total + item.coordinate[0],
        0
      ) / grouped.length;

    const averageLng =
      grouped.reduce(
        (total, item) =>
          total + item.coordinate[1],
        0
      ) / grouped.length;

    clusters.push({
      id: grouped
        .map((item) => item.dealer.id)
        .sort((a, b) => a - b)
        .join("-"),

      coordinate: [
        averageLat,
        averageLng,
      ],

      dealers: grouped.map(
        (item) => item.dealer
      ),
    });
  }

  return clusters;
}

function DealerMapMarker({
  dealer,
  active,
  onClick,
}: {
  dealer: Dealer;
  active: boolean;
  onClick: () => void;
}) {
  const [arrowElement, setArrowElement] =
    useState<SVGSVGElement | null>(null);
  const {
    refs,
    floatingStyles,
    context,
  } = useFloating({
    open: active,
    placement: "right",
    strategy: "fixed",
    whileElementsMounted: (
      reference,
      floating,
      update
    ) =>
      autoUpdate(reference, floating, update, {
        animationFrame: true,
      }),
    middleware: [
      offset(14),
      flip({ padding: 16 }),
      shift({ padding: 16 }),
      arrow({ element: arrowElement }),
    ],
  });

  return (
    <>
      <button
        ref={refs.setReference}
        type="button"
        aria-label={dealer.name}
        title={dealer.name}
        onClick={(event) => {
          event.stopPropagation();
          onClick();
        }}
        className={`
          group relative flex h-[58px] w-[48px] cursor-pointer
          items-end justify-center border-0 bg-transparent p-0 outline-none
          transition-transform duration-200
          ${active ? "scale-[1.12]" : "scale-100"}
          hover:scale-[1.14] active:scale-[0.98]
          sm:h-[62px] sm:w-[51px] lg:h-[66px] lg:w-[54px]
        `}
      >
        <span className="absolute bottom-[-1px] left-1/2 h-[6px] w-[22px] -translate-x-1/2 rounded-full bg-black/20 blur-[4px] lg:h-[7px] lg:w-[25px]" />
        <Image
          src="/assets/images/blip.webp"
          alt=""
          width={54}
          height={66}
          draggable={false}
          className={`
            relative z-[2] h-auto w-[48px] select-none object-contain
            drop-shadow-[0_6px_8px_rgba(0,0,0,0.23)] transition-all duration-200
            sm:w-[51px] lg:w-[54px]
            ${active ? "drop-shadow-[0_8px_12px_rgba(0,0,0,0.32)]" : ""}
          `}
        />
      </button>

      {active && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            className="z-[100] hidden w-[260px] rounded-[16px] border border-white/55 bg-white/80 px-[16px] py-[14px] shadow-[0_12px_35px_rgba(0,0,0,0.2)] backdrop-blur-xl backdrop-saturate-150 lg:block"
          >
            <FloatingArrow
              ref={setArrowElement}
              context={context}
              width={22}
              height={11}
              tipRadius={2}
              fill="rgba(255,255,255,0.88)"
              stroke="rgba(255,255,255,0.72)"
              strokeWidth={1}
            />

            <div className="flex items-start gap-[10px]">
              <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-black text-white">
                <MapPin size={16} strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <p className="font-[var(--font-sf-pro)] text-[15px] font-semibold leading-tight text-black">
                  {dealer.name}
                </p>
                <p className="mt-[5px] font-[var(--font-sf-pro)] text-[11px] font-normal leading-[1.35] text-[#4f4f4f]">
                  {dealer.address}
                </p>
              </div>
            </div>
          </div>
        </FloatingPortal>
      )}
    </>
  );
}

/* ============================================================
   COMPONENT
============================================================ */

export default function DealerLocator() {
  const [selectedDealer, setSelectedDealer] =
    useState<Dealer>(dealers[0]);

  const [search, setSearch] = useState("");

  const mobileSliderRef = useRef<HTMLDivElement>(null);
  const mobileDealerRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  const [dealerCoords, setDealerCoords] =
    useState<Record<number, Coordinates>>({});

  const [center, setCenter] =
    useState<Coordinates>([
      45.5601,
      -73.7124,
    ]);

  const [zoom, setZoom] =
    useState(12);

  const [
    locationsLoading,
    setLocationsLoading,
  ] = useState(true);

  /* =========================================================
     FILTER DEALERS
  ========================================================= */

  const filteredDealers = useMemo(() => {
    const value = search
      .trim()
      .toLowerCase();

    if (!value) {
      return dealers;
    }

    return dealers.filter(
      (dealer) =>
        dealer.name
          .toLowerCase()
          .includes(value) ||
        dealer.address
          .toLowerCase()
          .includes(value)
    );
  }, [search]);

  /* =========================================================
     DEALER POINTS
  ========================================================= */

  const dealerPoints =
    useMemo<DealerPoint[]>(() => {
      return dealers
        .map((dealer) => {
          const coordinate =
            dealerCoords[dealer.id];

          if (!coordinate) {
            return null;
          }

          return {
            dealer,
            coordinate,
          };
        })
        .filter(
          (
            item
          ): item is DealerPoint =>
            item !== null
        );
    }, [dealerCoords]);

  /* =========================================================
     CLUSTERS
  ========================================================= */

  const clusters = useMemo(
    () =>
      createClusters(
        dealerPoints,
        zoom
      ),
    [dealerPoints, zoom]
  );

  /* =========================================================
     LOAD COORDINATES
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    const sleep = (ms: number) =>
      new Promise((resolve) =>
        setTimeout(resolve, ms)
      );

    const loadCoordinates = async () => {
      let storedCoordinates: Record<
        number,
        Coordinates
      > = {};

      /* CACHE */

      try {
        const saved =
          localStorage.getItem(
            CACHE_KEY
          );

        if (saved) {
          storedCoordinates =
            JSON.parse(saved);

          if (!cancelled) {
            setDealerCoords(
              storedCoordinates
            );
          }
        }
      } catch {
        storedCoordinates = {};
      }

      const missingDealers =
        dealers.filter(
          (dealer) =>
            !storedCoordinates[
              dealer.id
            ]
        );

      if (
        missingDealers.length === 0
      ) {
        if (!cancelled) {
          setLocationsLoading(false);
        }

        return;
      }

      /* LOOK UP MISSING LOCATIONS */

      for (
        let index = 0;
        index <
        missingDealers.length;
        index++
      ) {
        if (cancelled) return;

        const dealer =
          missingDealers[index];

        try {
          const params =
            new URLSearchParams({
              q: dealer.mapQuery,
              format: "jsonv2",
              limit: "1",
            });

          const response =
            await fetch(
              `https://nominatim.openstreetmap.org/search?${params.toString()}`,
              {
                headers: {
                  Accept:
                    "application/json",
                },
              }
            );

          if (!response.ok) {
            throw new Error(
              "Location lookup failed"
            );
          }

          const results =
            await response.json();

          if (
            Array.isArray(results) &&
            results.length > 0
          ) {
            const lat = Number(
              results[0].lat
            );

            const lng = Number(
              results[0].lon
            );

            if (
              Number.isFinite(lat) &&
              Number.isFinite(lng)
            ) {
              storedCoordinates = {
                ...storedCoordinates,

                [dealer.id]: [
                  lat,
                  lng,
                ],
              };

              if (!cancelled) {
                setDealerCoords({
                  ...storedCoordinates,
                });
              }

              try {
                localStorage.setItem(
                  CACHE_KEY,
                  JSON.stringify(
                    storedCoordinates
                  )
                );
              } catch {
                // Ignore cache errors
              }
            }
          }
        } catch (error) {
          console.error(
            `Could not locate ${dealer.name}:`,
            error
          );
        }

        if (
          index <
          missingDealers.length - 1
        ) {
          await sleep(1100);
        }
      }

      if (!cancelled) {
        setLocationsLoading(false);
      }
    };

    loadCoordinates();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =========================================================
     SELECTED LOCATION
  ========================================================= */

  const selectedCoordinate =
    dealerCoords[selectedDealer.id];

  useEffect(() => {
    const slider = mobileSliderRef.current;
    const activeCard = mobileDealerRefs.current[selectedDealer.id];

    if (!slider || !activeCard || window.matchMedia("(min-width: 1024px)").matches) {
      return;
    }

    const sliderLeft =
      slider.getBoundingClientRect().left;
    const cardLeft =
      activeCard.getBoundingClientRect().left;

    slider.scrollTo({
      left:
        slider.scrollLeft +
        cardLeft -
        sliderLeft,
      behavior: "smooth",
    });
  }, [selectedDealer.id]);

  useEffect(() => {
    if (!selectedCoordinate) {
      return;
    }

    setCenter(selectedCoordinate);
    setZoom(14);
  }, [
    selectedDealer.id,
    selectedCoordinate?.[0],
    selectedCoordinate?.[1],
  ]);

  /* =========================================================
     DEALER CLICK
  ========================================================= */

  const handleDealerClick = (
    dealer: Dealer
  ) => {
    setSelectedDealer(dealer);

    const coordinate =
      dealerCoords[dealer.id];

    if (!coordinate) return;

    setCenter(coordinate);
    setZoom(14);
  };

  /* =========================================================
     MAP PIN CLICK
  ========================================================= */

  const handlePinClick = (
    dealer: Dealer
  ) => {
    setSelectedDealer(dealer);

    const coordinate =
      dealerCoords[dealer.id];

    if (!coordinate) return;

    setCenter(coordinate);

    if (zoom < 13) {
      setZoom(13);
    }
  };

  /* =========================================================
     CLUSTER CLICK
  ========================================================= */

  const handleClusterClick = (
    cluster: DealerCluster
  ) => {
    setCenter(cluster.coordinate);

    setZoom((current) =>
      Math.min(current + 2, 18)
    );
  };

  return (
    <section className="w-full overflow-hidden bg-white">
      <div
        className="
          mx-auto
          w-full
          max-w-[1600px]

          px-[16px]
          py-[42px]

          sm:px-[35px]
          sm:py-[60px]

          lg:px-[60px]
          lg:py-[90px]
        "
      >
        <div
          className="
            grid
            grid-cols-1

            lg:grid-cols-[41%_59%]
          "
        >
          {/* =====================================================
              LEFT SIDE
          ====================================================== */}

          <div
            className="
              flex
              min-h-0
              flex-col
              bg-white

              lg:h-[790px]
              lg:pr-[30px]
            "
          >
            {/* =================================================
                SEARCH
            ================================================= */}

            <div
              className="
                pb-[16px]

                sm:pb-[20px]

                lg:pb-[26px]
              "
            >
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search dealer or address..."
                  className="
                    h-[48px]
                    w-full

                    rounded-[12px]

                    border-0

                    bg-[#eeeeee]

                    px-[16px]
                    pr-[48px]

                    font-[var(--font-sf-pro)]

                    text-[14px]
                    font-normal
                    text-black

                    outline-none

                    placeholder:text-[#7c7c7c]

                    sm:h-[56px]
                    sm:px-[18px]
                    sm:pr-[54px]
                    sm:text-[16px]

                    lg:h-[62px]
                    lg:text-[17px]
                  "
                />

                <Search
                  className="
                    pointer-events-none

                    absolute
                    right-[16px]
                    top-1/2

                    h-[20px]
                    w-[20px]

                    -translate-y-1/2

                    text-black

                    sm:right-[18px]
                    sm:h-[23px]
                    sm:w-[23px]

                    lg:h-[25px]
                    lg:w-[25px]
                  "
                  strokeWidth={2}
                />
              </div>
            </div>

            {/* =================================================
                MOBILE DEALER SLIDER
            ================================================= */}

            <div
              ref={mobileSliderRef}
              className="
                flex
                snap-x
                snap-mandatory

                gap-[10px]

                overflow-x-auto

                pb-[8px]

                [scrollbar-width:none]
                [&::-webkit-scrollbar]:hidden

                lg:hidden
              "
            >
              {filteredDealers.length > 0 ? (
                filteredDealers.map(
                  (dealer) => {
                    const active =
                      selectedDealer.id ===
                      dealer.id;

                    return (
                      <button
                        key={dealer.id}
                        ref={(element) => {
                          mobileDealerRefs.current[dealer.id] = element;
                        }}
                        type="button"
                        onClick={() =>
                          handleDealerClick(
                            dealer
                          )
                        }
                        className={`
                          flex
                          min-h-[112px]
                          w-[72vw]
                          max-w-[275px]
                          shrink-0
                          snap-start

                          items-start

                          gap-[11px]

                          rounded-[15px]

                          border

                          px-[14px]
                          py-[14px]

                          text-left

                          transition-all
                          duration-200

                          ${
                            active
                              ? "border-black bg-black text-white"
                              : "border-[#e5e5e5] bg-[#f7f7f7] text-black"
                          }

                          sm:w-[320px]
                          sm:max-w-[320px]
                        `}
                      >
                        {/* PIN */}
                        <div
                          className={`
                            flex
                            h-[31px]
                            w-[31px]
                            shrink-0

                            items-center
                            justify-center

                            rounded-full

                            ${
                              active
                                ? "bg-white text-black"
                                : "bg-white text-[#666666]"
                            }
                          `}
                        >
                          <MapPin
                            size={16}
                            strokeWidth={2.1}
                          />
                        </div>

                        {/* TEXT */}
                        <div className="min-w-0 flex-1">
                          <h3
                            className="
                              line-clamp-1

                              font-[var(--font-sf-pro)]

                              text-[14px]
                              font-semibold
                              leading-[1.2]
                            "
                          >
                            {dealer.name}
                          </h3>

                          <p
                            className={`
                              mt-[7px]

                              line-clamp-2

                              font-[var(--font-sf-pro)]

                              text-[11px]
                              font-normal
                              leading-[1.4]

                              ${
                                active
                                  ? "text-white/70"
                                  : "text-[#777777]"
                              }
                            `}
                          >
                            {dealer.address}
                          </p>

                          <p
                            className={`
                              mt-[8px]

                              font-[var(--font-sf-pro)]

                              text-[9px]
                              font-semibold
                              uppercase
                              tracking-[0.08em]

                              ${
                                active
                                  ? "text-white"
                                  : "text-black"
                              }
                            `}
                          >
                            View on map →
                          </p>
                        </div>
                      </button>
                    );
                  }
                )
              ) : (
                <div
                  className="
                    flex
                    h-[100px]
                    w-full
                    items-center
                    justify-center

                    rounded-[14px]

                    bg-[#f7f7f7]

                    px-[20px]

                    text-center
                  "
                >
                  <p className="font-[var(--font-sf-pro)] text-[13px] text-[#777777]">
                    No dealers found.
                  </p>
                </div>
              )}
            </div>

            {/* =================================================
                DESKTOP DEALER LIST
            ================================================= */}

            <div
              className="
                hidden
                min-h-0
                flex-1

                overflow-y-auto

                pr-[18px]

                [scrollbar-color:#000_#efefef]
                [scrollbar-width:thin]

                [&::-webkit-scrollbar]:w-[9px]

                [&::-webkit-scrollbar-track]:rounded-full
                [&::-webkit-scrollbar-track]:bg-[#efefef]

                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-thumb]:bg-black

                lg:block
              "
            >
              {filteredDealers.length > 0 ? (
                filteredDealers.map(
                  (dealer) => {
                    const active =
                      selectedDealer.id ===
                      dealer.id;

                    return (
                      <button
                        key={dealer.id}
                        type="button"
                        onClick={() =>
                          handleDealerClick(
                            dealer
                          )
                        }
                        className={`
                          group

                          flex
                          w-full
                          items-start

                          gap-[20px]

                          border-b
                          border-[#eeeeee]

                          px-[8px]
                          py-[34px]

                          text-left

                          transition-colors
                          duration-200

                          hover:bg-[#f7f7f7]

                          ${
                            active
                              ? "bg-[#f7f7f7]"
                              : "bg-white"
                          }
                        `}
                      >
                        <div className="pt-[1px]">
                          <MapPin
                            size={29}
                            strokeWidth={2.2}
                            className={
                              active
                                ? "text-black"
                                : "text-[#777777]"
                            }
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3
                            className="
                              font-[var(--font-sf-pro)]

                              text-[24px]
                              font-semibold
                              leading-[1.15]

                              text-black
                            "
                          >
                            {dealer.name}
                          </h3>

                          <p
                            className="
                              mt-[14px]
                              max-w-[470px]

                              font-[var(--font-sf-pro)]

                              text-[18px]
                              font-normal
                              leading-[1.32]

                              text-[#7a7a7a]
                            "
                          >
                            {dealer.address}
                          </p>
                        </div>
                      </button>
                    );
                  }
                )
              ) : (
                <div className="flex h-[180px] items-center justify-center px-[20px] text-center">
                  <p className="font-[var(--font-sf-pro)] text-[16px] text-[#777777]">
                    No dealers found.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* =====================================================
              MAP
          ====================================================== */}

          <div
            className="
              relative

              mt-[18px]

              h-[360px]
              w-full

              overflow-hidden

              rounded-[18px]

              bg-[#e7edef]

              sm:mt-[24px]
              sm:h-[480px]
              sm:rounded-[22px]

              lg:mt-0
              lg:h-[790px]
              lg:rounded-none
            "
          >
            <PigeonMap
              center={center}
              zoom={zoom}
              minZoom={2}
              maxZoom={18}
              animate
              metaWheelZoom={false}
              attribution={
                <span className="font-[var(--font-sf-pro)] text-[9px] sm:text-[10px]">
                  © OpenStreetMap contributors
                </span>
              }
              onBoundsChanged={({
                center: newCenter,
                zoom: newZoom,
              }) => {
                setCenter(
                  newCenter as Coordinates
                );

                setZoom(newZoom);
              }}
            >
              <ZoomControl />

              {/* =================================================
                  CLUSTERS / BLIPS
              ================================================= */}

              {clusters.map(
                (cluster) => {
                  const isCluster =
                    cluster.dealers
                      .length > 1;

                  /* NUMBER CLUSTER */

                  if (isCluster) {
                    const count =
                      cluster.dealers
                        .length;

                    return (
                      <Overlay
                        key={`cluster-${cluster.id}`}
                        anchor={
                          cluster.coordinate
                        }
                        offset={[28, 28]}
                      >
                        <button
                          type="button"
                          aria-label={`Zoom into ${count} dealers`}
                          onClick={(event) => {
                            event.stopPropagation();

                            handleClusterClick(
                              cluster
                            );
                          }}
                          className="
                            flex
                            h-[56px]
                            w-[56px]

                            cursor-pointer

                            items-center
                            justify-center

                            rounded-full

                            border-[6px]
                            border-black/20

                            bg-[#292929]

                            font-[var(--font-sf-pro)]

                            text-[15px]
                            font-semibold
                            text-white

                            shadow-[0_5px_18px_rgba(0,0,0,0.22)]

                            transition-all
                            duration-200

                            hover:scale-[1.08]
                            hover:bg-black

                            active:scale-95

                            sm:h-[64px]
                            sm:w-[64px]
                            sm:text-[17px]

                            lg:h-[68px]
                            lg:w-[68px]
                            lg:border-[7px]
                            lg:text-[18px]
                          "
                        >
                          {count}
                        </button>
                      </Overlay>
                    );
                  }

                  /* SINGLE DEALER */

                  const dealer =
                    cluster.dealers[0];

                  const active =
                    selectedDealer.id ===
                    dealer.id;

                  return (
                    <Overlay
                      key={`dealer-${dealer.id}`}
                      anchor={
                        cluster.coordinate
                      }
                      offset={[24, 58]}
                    >
                      <DealerMapMarker
                        dealer={dealer}
                        active={active}
                        onClick={() =>
                          handlePinClick(dealer)
                        }
                      />
                    </Overlay>
                  );
                }
              )}
            </PigeonMap>

            {/* =================================================
                MOBILE SELECTED LABEL
            ================================================= */}

            <div
              className="
                pointer-events-none

                absolute
                bottom-[12px]
                left-[12px]
                right-[12px]
                z-20

                rounded-[12px]

                bg-white/95

                px-[13px]
                py-[11px]

                shadow-[0_5px_20px_rgba(0,0,0,0.14)]

                backdrop-blur-md

                sm:hidden
              "
            >
              <div className="flex items-center gap-[10px]">
                <div
                  className="
                    flex
                    h-[29px]
                    w-[29px]
                    shrink-0

                    items-center
                    justify-center

                    rounded-full

                    bg-black
                    text-white
                  "
                >
                  <MapPin
                    size={14}
                    strokeWidth={2}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className="
                      truncate

                      font-[var(--font-sf-pro)]

                      text-[12px]
                      font-semibold

                      text-black
                    "
                  >
                    {selectedDealer.name}
                  </p>

                  <p
                    className="
                      mt-[2px]
                      truncate

                      font-[var(--font-sf-pro)]

                      text-[9px]
                      text-[#777777]
                    "
                  >
                    {selectedDealer.address}
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
                LOADING
            ================================================= */}

            {locationsLoading &&
              dealerPoints.length === 0 && (
                <div
                  className="
                    pointer-events-none

                    absolute
                    inset-0
                    z-30

                    flex
                    items-center
                    justify-center

                    bg-[#edf1f2]/80

                    backdrop-blur-[2px]
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      gap-[9px]

                      rounded-full

                      bg-white

                      px-[15px]
                      py-[9px]

                      shadow-[0_5px_22px_rgba(0,0,0,0.12)]

                      sm:gap-[11px]
                      sm:px-[18px]
                      sm:py-[11px]
                    "
                  >
                    <div
                      className="
                        h-[13px]
                        w-[13px]

                        animate-spin

                        rounded-full

                        border-2
                        border-black/20
                        border-t-black

                        sm:h-[15px]
                        sm:w-[15px]
                      "
                    />

                    <span
                      className="
                        whitespace-nowrap

                        font-[var(--font-sf-pro)]

                        text-[10px]
                        font-medium

                        text-black

                        sm:text-[12px]
                      "
                    >
                      Locating dealers...
                    </span>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </section>
  );
}
