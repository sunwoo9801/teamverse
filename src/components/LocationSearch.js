// import React, { useState, useRef } from "react";
// import { GoogleMap, LoadScript, Autocomplete, Marker } from "@react-google-maps/api";
// import { GOOGLE_MAPS_API_KEY } from "../config"; // ✅ config.js에서 API 키 가져오기

// const libraries = ["places"]; // Places API 사용을 위해 추가

// const mapContainerStyle = {
//   width: "100%",
//   height: "400px",
// };

// const defaultCenter = { lat: 37.5665, lng: 126.9780 }; // 서울 기본 위치

// const LocationSearch = ({ onSelect }) => {
//   const [map, setMap] = useState(null);
//   const [autocomplete, setAutocomplete] = useState(null);
//   const [markerPosition, setMarkerPosition] = useState(null);
//   const inputRef = useRef(null);

//   // 검색어 입력 후 장소 선택 시 실행
//   const onPlaceSelected = () => {
//     if (autocomplete) {
//       const place = autocomplete.getPlace();
//       if (!place.geometry || !place.geometry.location) {
//         alert("장소 정보를 찾을 수 없습니다.");
//         return;
//       }

//       const location = {
//         lat: place.geometry.location.lat(),
//         lng: place.geometry.location.lng(),
//         name: place.name,
//         address: place.formatted_address || "",
//       };

//       setMarkerPosition(location);
//       onSelect(location); // 부모 컴포넌트에 선택된 장소 전달
//       map.panTo(location); // 지도 이동
//       map.setZoom(17); // 확대
//     }
//   };

//   return (
//     <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY" libraries={libraries}>
//       <div>
//         <Autocomplete
//           onLoad={(auto) => setAutocomplete(auto)}
//           onPlaceChanged={onPlaceSelected}
//         >
//           <input
//             type="text"
//             ref={inputRef}
//             placeholder="장소 검색"
//             style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
//           />
//         </Autocomplete>

//         <GoogleMap
//           mapContainerStyle={mapContainerStyle}
//           center={markerPosition || defaultCenter}
//           zoom={13}
//           onLoad={(map) => setMap(map)}
//         >
//           {markerPosition && <Marker position={markerPosition} />}
//         </GoogleMap>
//       </div>
//     </LoadScript>
//   );
// };

// export default LocationSearch;






// import React, { useState, useRef, useEffect } from "react";
// import { LoadScript, StandaloneSearchBox } from "@react-google-maps/api"; // ✅ Google Maps API
// import { GOOGLE_MAPS_API_KEY } from "../config"; // ✅ 프로젝트에서 사용 중인 API 키 가져오기


// const libraries = ["places"]; // ✅ Google Places API 사용

// const LocationSearch = ({ onSelect }) => {
//   const [searchBox, setSearchBox] = useState(null);
//   const inputRef = useRef(null);

//   // ✅ 장소 선택 시 실행되는 함수
//   const onPlacesChanged = () => {
//     if (searchBox) {
//       const places = searchBox.getPlaces();
//       if (places.length === 0) return;

//       const place = places[0];
//       const locationData = {
//         address: place.formatted_address,
//         lat: place.geometry.location.lat(),
//         lng: place.geometry.location.lng(),
//       };

//       onSelect(locationData); // ✅ 선택된 장소 정보 전달
//     }
//   };

//   return (
//     <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={libraries}>
//       <StandaloneSearchBox
//         onLoad={(ref) => setSearchBox(ref)}
//         onPlacesChanged={onPlacesChanged}
//       >
//         <input
//           ref={inputRef}
//           type="text"
//           placeholder="장소 검색"
//           className="location-input"
//         />
//       </StandaloneSearchBox>
//     </LoadScript>
//   );
// };

// export default LocationSearch;

// import React, { useState, useEffect, useRef } from "react";
// import { LoadScript, StandaloneSearchBox } from "@react-google-maps/api";
// import { GOOGLE_MAPS_API_KEY } from "../config"; // ✅ API 키 가져오기


// const libraries = ["places"];

// const LocationSearch = ({ onSelect }) => {
//   const inputRef = useRef(null);
//   const searchBoxRef = useRef(null);
//   const [isLoaded, setIsLoaded] = useState(false);
//   const [position, setPosition] = useState({ top: "0px", left: "0px", width: "100%" });

  

//   // ✅ Google Maps API가 로드되었는지 확인
//   useEffect(() => {
//     if (window.google && window.google.maps) {
//       setIsLoaded(true);
//     }
//   }, []);

//   // ✅ 입력 필드 위치 계산하여 검색 결과 위치 조정
//   useEffect(() => {
//     if (inputRef.current) {
//       const rect = inputRef.current.getBoundingClientRect();
//       setPosition({
//         top: `${rect.bottom + window.scrollY}px`, // ✅ 입력창 바로 아래 위치
//         left: `${rect.left}px`, // ✅ 입력창 왼쪽 정렬
//         width: `${rect.width}px`, // ✅ 입력창과 동일한 너비
//       });
//     }
//   }, [isLoaded]);


//   // ✅ 장소 선택 이벤트
//   const onPlacesChanged = () => {
//     if (searchBoxRef.current) {
//       const places = searchBoxRef.current.getPlaces();
//       if (!places || places.length === 0) return;


//       const place = places[0];
//       if (!place.geometry || !place.geometry.location) {
//         alert("선택한 장소의 위치 정보를 가져올 수 없습니다.");
//         return;
//       }
//       const locationData = {
//         address: place.formatted_address || place.name,
//         lat: place.geometry.location.lat(),
//         lng: place.geometry.location.lng(),
//       };

//       onSelect(locationData); // ✅ 선택된 장소 정보 전달
//     }
//   };

//   return (
//     <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={libraries} onLoad={() => setIsLoaded(true)}>
//       <div className="location-container">
//         {isLoaded ? (
//           <StandaloneSearchBox onLoad={(ref) => (searchBoxRef.current = ref)} onPlacesChanged={onPlacesChanged}>
//             <input
//               ref={inputRef}
//               type="text"
//               placeholder="장소 검색"
//               className="location-input"
//               style={{
//                 width: "100%",
//                 padding: "12px",
//                 border: "1px solid #ccc",
//                 borderRadius: "6px",
//                 fontSize: "16px",
//               }}
//             />
//           </StandaloneSearchBox>
//         ) : (
//           <p>🔄 Google Maps API 로드 중...</p>
//         )}

// {/* 🔥 검색 목록이 모달보다 위에 나오도록 설정 */}
// <ul
//           className="location-suggestions"
//           style={{
//             position: "fixed",
//             top: position.top,
//             left: position.left,
//             width: position.width,
//             zIndex: 10060, // ✅ TaskModal보다 높은 값 설정
//             background: "white",
//             border: "1px solid #ddd",
//             borderRadius: "6px",
//             boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
//             maxHeight: "250px",
//             overflowY: "auto",
//           }}
//         >
//           {/* 검색 결과 예시 */}
//           <li className="location-item">📍 검색 결과 예시</li>
//         </ul>
//       </div>
//     </LoadScript>
//   );
// };

// export default LocationSearch;





// import React, { useState, useRef, useEffect } from "react";
// import ReactDOM from "react-dom";
// import { LoadScript, StandaloneSearchBox } from "@react-google-maps/api";

// const libraries = ["places"];
// const BACKEND_API_URL = "http://localhost:8082/api/google";

// const LocationSearch = ({ onSelect }) => {
//   const inputRef = useRef(null);
//   const searchBoxRef = useRef(null);
//   const [suggestions, setSuggestions] = useState([]);
//   const [isGoogleAPILoaded, setIsGoogleAPILoaded] = useState(false);
//   const [position, setPosition] = useState({ top: "0px", left: "0px", width: "100%" });

//   // ✅ LoadScript 로드 완료 후 상태 변경
//   const handleScriptLoad = () => {
//     setIsGoogleAPILoaded(true);
//   };

//   useEffect(() => {
//     if (inputRef.current) {
//       const rect = inputRef.current.getBoundingClientRect();
//       setPosition({
//         top: `${rect.bottom + window.scrollY}px`,
//         left: `${rect.left}px`,
//         width: `${rect.width}px`,
//       });
//     }
//   }, [suggestions]);

//   // ✅ 장소 선택 이벤트 (수정: getPlaces()를 실행한 후 검증 추가)
//   const onPlacesChanged = async () => {
//     if (!searchBoxRef.current) return;
    
//     const places = searchBoxRef.current.getPlaces();
//     if (!places || places.length === 0) {
//       console.warn("🚨 장소 목록이 비어 있음");
//       return;
//     }

//     setSuggestions(places);

//     const place = places[0];
//     if (!place.geometry || !place.geometry.location) {
//       alert("선택한 장소의 위치 정보를 가져올 수 없습니다.");
//       return;
//     }

//     const locationData = {
//       address: place.formatted_address || place.name,
//       placeId: place.place_id,
//       lat: place.geometry.location.lat(),
//       lng: place.geometry.location.lng(),
//     };

//     try {
//       const response = await fetch(`${BACKEND_API_URL}/place-details?placeId=${locationData.placeId}`);
//       const detailsData = await response.json();

//       if (detailsData.result) {
//         const placeName = detailsData.result.name || locationData.address;
//         const formattedAddress = detailsData.result.formatted_address || locationData.address;
//         const googleMapsUrl = `https://www.google.com/maps/place/?q=place_id=${locationData.placeId}`;

//         const placePhotoUrl = detailsData.result.photos?.length
//           ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${detailsData.result.photos[0].photo_reference}&key=YOUR_BACKEND_PROTECTED_KEY`
//           : "https://via.placeholder.com/400";

//         onSelect({
//           name: placeName,
//           address: formattedAddress,
//           lat: locationData.lat,
//           lng: locationData.lng,
//           url: googleMapsUrl,
//           placeId: locationData.placeId,
//           thumbnail: placePhotoUrl,
//         });
//       }
//     } catch (error) {
//       console.error("🚨 장소 정보를 가져오는 중 오류 발생:", error);
//     }

//     setSuggestions([]);
//   };

//   return (
//     <LoadScript
//       googleMapsApiKey="YOUR_BACKEND_PROTECTED_KEY"
//       libraries={libraries}
//       onLoad={handleScriptLoad}
//     >
//       {isGoogleAPILoaded ? (
//         <div className="location-container" style={{ position: "relative", zIndex: 10080 }}>
//           <StandaloneSearchBox onLoad={(ref) => (searchBoxRef.current = ref)} onPlacesChanged={onPlacesChanged}>
//             <input
//               ref={inputRef}
//               type="text"
//               placeholder="장소 검색"
//               className="location-input"
//               style={{
//                 width: "100%",
//                 padding: "12px",
//                 border: "1px solid #ccc",
//                 borderRadius: "6px",
//                 fontSize: "16px",
//                 zIndex: 10080,
//               }}
//             />
//           </StandaloneSearchBox>

//           {suggestions.length > 0 &&
//             ReactDOM.createPortal(
//               <ul
//                 className="location-suggestions"
//                 style={{
//                   position: "fixed",
//                   top: position.top,
//                   left: position.left,
//                   width: position.width,
//                   zIndex: 10080,
//                   background: "white",
//                   border: "1px solid #ddd",
//                   borderRadius: "6px",
//                   boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
//                   maxHeight: "250px",
//                   overflowY: "auto",
//                 }}
//               >
//                 {suggestions.map((place, index) => (
//                   <li
//                     key={index}
//                     onClick={() => {
//                       onSelect({
//                         address: place.formatted_address || place.name,
//                         lat: place.geometry.location.lat(),
//                         lng: place.geometry.location.lng(),
//                       });
//                       setSuggestions([]);
//                     }}
//                     className="location-item"
//                     style={{
//                       padding: "10px",
//                       cursor: "pointer",
//                       borderBottom: "1px solid #ddd",
//                       backgroundColor: "white",
//                     }}
//                   >
//                     📍 {place.formatted_address || place.name}
//                   </li>
//                 ))}
//               </ul>,
//               document.body
//             )}
//         </div>
//       ) : (
//         <p>Loading Google Maps...</p>
//       )}
//     </LoadScript>
//   );
// };

// export default LocationSearch;



import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { LoadScript, StandaloneSearchBox } from "@react-google-maps/api";

const libraries = ["places"];
const BACKEND_API_URL = "http://localhost:8082/api/google";

const LocationSearch = ({ onSelect }) => {
  const inputRef = useRef(null);
  const searchBoxRef = useRef(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isGoogleAPILoaded, setIsGoogleAPILoaded] = useState(false);
  const [position, setPosition] = useState({ top: "0px", left: "0px", width: "100%" });

  // ✅ LoadScript 로드 완료 후 상태 변경
  const handleScriptLoad = () => {
    if (window.google) {
      setIsGoogleAPILoaded(true);
    } else {
      console.error("🚨 Google Maps API 로드 실패");
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setPosition({
        top: `${rect.bottom + window.scrollY}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
      });
    }
  }, [suggestions]);

  // ✅ 장소 선택 이벤트 (수정: getPlaces()를 실행한 후 검증 추가)
  const onPlacesChanged = async () => {
    if (!searchBoxRef.current) return;
    if (!window.google || !window.google.maps) {
      console.error("🚨 Google Maps API가 로드되지 않았습니다.");
      return;
    }
    
    const places = searchBoxRef.current.getPlaces();
    if (!places || places.length === 0) {
      console.warn("🚨 장소 목록이 비어 있음");
      return;
    }

    setSuggestions(places);

    const place = places[0];
    if (!place.geometry || !place.geometry.location) {
      alert("선택한 장소의 위치 정보를 가져올 수 없습니다.");
      return;
    }

    const locationData = {
      address: place.formatted_address || place.name,
      placeId: place.place_id,
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };

    try {
      const response = await fetch(`${BACKEND_API_URL}/place-details?placeId=${locationData.placeId}`);
      const detailsData = await response.json();

      if (detailsData.result) {
        const placeName = detailsData.result.name || locationData.address;
        const formattedAddress = detailsData.result.formatted_address || locationData.address;
        const googleMapsUrl = `https://www.google.com/maps/place/?q=place_id=${locationData.placeId}`;

        const placePhotoUrl = detailsData.result.photos?.length
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${detailsData.result.photos[0].photo_reference}&key=YOUR_BACKEND_PROTECTED_KEY`
          : "https://via.placeholder.com/400";

        onSelect({
          name: placeName,
          address: formattedAddress,
          lat: locationData.lat,
          lng: locationData.lng,
          url: googleMapsUrl,
          placeId: locationData.placeId,
          thumbnail: placePhotoUrl,
        });
      }
    } catch (error) {
      console.error("🚨 장소 정보를 가져오는 중 오류 발생:", error);
    }

    setSuggestions([]);
  };

  return (
    <LoadScript
      googleMapsApiKey="YOUR_BACKEND_PROTECTED_KEY"
      libraries={libraries}
      onLoad={handleScriptLoad}
    >
      {isGoogleAPILoaded ? (
        <div className="location-container" style={{ position: "relative", zIndex: 10080 }}>
          <StandaloneSearchBox onLoad={(ref) => (searchBoxRef.current = ref)} onPlacesChanged={onPlacesChanged}>
            <input
              ref={inputRef}
              type="text"
              placeholder="장소 검색"
              className="location-input"
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                fontSize: "16px",
                zIndex: 10080,
              }}
            />
          </StandaloneSearchBox>

          {suggestions.length > 0 &&
            ReactDOM.createPortal(
              <ul
                className="location-suggestions"
                style={{
                  position: "fixed",
                  top: position.top,
                  left: position.left,
                  width: position.width,
                  zIndex: 10080,
                  background: "white",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                  maxHeight: "250px",
                  overflowY: "auto",
                }}
              >
                {suggestions.map((place, index) => (
                  <li
                    key={index}
                    onClick={() => {
                      onSelect({
                        address: place.formatted_address || place.name,
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng(),
                      });
                      setSuggestions([]);
                    }}
                    className="location-item"
                    style={{
                      padding: "10px",
                      cursor: "pointer",
                      borderBottom: "1px solid #ddd",
                      backgroundColor: "white",
                    }}
                  >
                    📍 {place.formatted_address || place.name}
                  </li>
                ))}
              </ul>,
              document.body
            )}
        </div>
      ) : (
        <p>Loading Google Maps...</p>
      )}
    </LoadScript>
  );
};

export default LocationSearch;
