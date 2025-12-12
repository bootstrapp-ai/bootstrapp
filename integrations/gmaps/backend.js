if ($APP.settings.mv3) {
	const mv3Requests = {
		"/maps/preview/place": "PLACE_DATA_FETCHED",
		"/search?tbm=map": "SEARCH_RESULTS_FETCHED",
	};

	$APP.mv3Requests.set(mv3Requests);

	async function parseReviews(reviews) {
		const parsedReviews = await Promise.all(
			reviews.map(([review]) => ({
				review_id: review[0],
				time: {
					published: review[1][2],
					last_edited: review[1][3],
				},
				author: {
					name: review[1][4][5][0],
					profile_url: review[1][4][5][1],
					url: review[1][4][5][2][0],
					id: review[1][4][5][3],
				},
				review: {
					rating: review[2][0][0],
					text: review[2][15]?.[0]?.[0] || null,
					language: review[2][14]?.[0] || null,
				},
				images:
					review[2][2]?.map((image) => ({
						id: image[0],
						url: image[1][6][0],
						size: {
							width: image[1][6][2][0],
							height: image[1][6][2][1],
						},
						location: {
							friendly: image[1][21][3][7]?.[0],
							lat: image[1][8][0][2],
							long: image[1][8][0][1],
						},
						caption: image[1][21][3][5]?.[0] || null,
					})) || null,
				source: review[1][13][0],
			})),
		);

		return JSON.stringify(parsedReviews, null, 2);
	}
	function findGoogleMediaUrls(data) {
		const mediaUrls = [];

		function traverse(obj, path = "") {
			if (Array.isArray(obj)) {
				obj.forEach((item, index) => traverse(item, `${path}[${index}]`));
			} else if (typeof obj === "object" && obj !== null) {
				Object.entries(obj).forEach(([key, value]) =>
					traverse(value, `${path}.${key}`),
				);
			} else if (
				typeof obj === "string" &&
				obj.includes("googleusercontent.com") &&
				obj.endsWith("-no")
			) {
				mediaUrls.push({ url: obj, path });
			}
		}

		traverse(data);
		return mediaUrls;
	}

	function getData(obj, path, modifier = (val) => val) {
		const result = path.reduce(
			(xs, x) => (xs && xs[x] !== undefined ? xs[x] : null),
			obj,
		);
		return result !== null ? modifier(result) : null;
	}

	function parseGoogleMapsData(jsonString) {
		const data = JSON.parse(jsonString);
		const mainData = data[6];
		const businessInfo = getPlaceData(mainData);
		return businessInfo;
	}

	async function fetchAndParsePlace({ url }) {
		try {
			const response = await fetch(url);
			const data = (await response.text()).slice(4);
			const parsedData = parseGoogleMapsData(data);
			chrome.runtime.sendMessage({
				type: "PLACE_DATA",
				data: parsedData,
			});
		} catch (error) {
			console.error("Error fetching or parsing place data:", error);
		}
	}

	async function fetchAndParseSearchResults({ url }) {
		try {
			const response = await fetch(url);
			const parsed = `${(await response.text()).slice(18)}`;
			const jsonMatch = parsed.match(/^.*\]/);
			if (!jsonMatch) {
				throw new Error("No valid JSON found in the response");
			}
			const jsonString = jsonMatch[0];
			const withPlaceholder = jsonString.replace(/\\\\/g, "__TEMP_BACKSLASH__");
			const withoutSingleBackslashes = withPlaceholder.replace(/\\/g, "");
			const processedString = withoutSingleBackslashes.replace(
				/__TEMP_BACKSLASH__/g,
				"\\",
			);

			// Parse the processed JSON string
			const jsonData = JSON.parse(processedString);
			const queryTitle = jsonData[0][0];
			const placeList = jsonData[0][1].slice(1);
			const parsedPlaceList = parsePlaceList(placeList);

			const data = {
				queryTitle,
				places: parsedPlaceList,
			};
			console.log("send message", {
				type: "PLACE_LIST_DATA",
				data,
			});
			$APP.mv3.postMessage({
				type: "PLACE_LIST_DATA",
				data,
			});

			return data;
		} catch (error) {
			console.error("Error fetching or parsing place list data:", error);
		}
	}

	function parsePlaceList(placeList) {
		return placeList.map((data) => getPlaceData(data[14]));
	}

	const getPlaceData = (mainData) => {
		return {
			name: getData(mainData, [11]),
			address: getData(mainData, [2], (arr) => arr.join(", ")),
			phoneNumber: getData(mainData, [178, 0, 0]),
			rating: getData(mainData, [4, 7]),
			reviewCount: getData(mainData, [4, 8]) || 0,
			priceRange: getData(mainData, [4, 2]),
			website: getData(mainData, [7, 0]),
			menu: getData(mainData, [7, 1]),
			openingHours:
				getData(
					mainData,
					[34, 1],
					(arr) =>
						Array.isArray(arr) &&
						arr.map((day) => ({
							day: day[0],
							hours: day[1],
						})),
				) || [],
			categories: getData(mainData, [13]) || [],
			coordinates: {
				latitude: getData(mainData, [9, 2]),
				longitude: getData(mainData, [9, 3]),
			},
			placeId: getData(mainData, [78]), // to generate google maps link: https://www.google.com/maps/search/?api=1&query=Google&query_place_id=ChIJN1t_tDeuEmsRUsoyG83frY4
			description: getData(
				mainData,
				[32],
				(arr) =>
					Array.isArray(arr) && arr.map((item) => item?.[1]).filter(Boolean),
			),
			popularTimes: getData(mainData, [84, 0]) || [],
			reviews:
				getData(
					mainData,
					[8],
					(arr) =>
						Array.isArray(arr) &&
						arr.map((review) => ({
							authorName: getData(review, [0, 1]),
							authorUrl: getData(review, [0, 0]),
							profilePhotoUrl: getData(review, [0, 2]),
							rating: getData(review, [4]),
							relativeTimeDescription: getData(review, [3]),
							text: getData(review, [1]),
							time: getData(review, [27]),
						})),
				) || [],
			amenities:
				getData(
					mainData,
					[100, 1],
					(arr) =>
						Array.isArray(arr) &&
						arr.flatMap((category) =>
							(category[2] || []).map((amenity) => ({
								category: category[1],
								name: getData(amenity, [1]),
								available: getData(amenity, [2, 0]) === 1,
							})),
						),
				) || [],
			recommendations:
				getData(
					mainData,
					[31, 0, 1],
					(arr) =>
						Array.isArray(arr) &&
						arr.map((place) => ({
							name: getData(place, [1]),
							placeId: getData(place, [0]),
							rating: getData(place, [4, 7]),
							reviewCount: getData(place, [4, 8]) || 0,
							categories: getData(place, [13]) || [],
						})),
				) || [],
			attributes:
				getData(
					mainData,
					[51],
					(arr) =>
						Array.isArray(arr) &&
						arr.map((attr) => ({
							name: getData(attr, [1]),
							value: getData(attr, [2]),
						})),
				) || [],
			businessStatus: getData(mainData, [147]),
			priceLevel: getData(mainData, [4, 2]),
			editorialSummary: getData(mainData, [147, 1]),
			reservation:
				getData(mainData, [4, 12], (res) => ({
					url: getData(res, [0]),
					provider: getData(res, [1]),
				})) || null,
			menuUrl: getData(mainData, [4, 37]),
			orderUrl: getData(mainData, [4, 6]),
			images: findGoogleMediaUrls(mainData),
		};
	};

	const events = {
		PLACE_DATA_FETCHED: fetchAndParsePlace,
		SEARCH_RESULTS_FETCHED: fetchAndParseSearchResults,
	};

	$APP.mv3Events.set(events);
}
