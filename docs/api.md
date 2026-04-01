# External APIs

모든 API는 무료 사용 기준. API Key 필요 여부 명시.

---

## Open Food Facts

- **용도**: 음식명 검색 → 영양정보 자동 입력
- **API Key**: 불필요
- **Base URL**: `https://world.openfoodfacts.org`

### 주요 엔드포인트

```
# 음식 검색
GET /cgi/search.pl?search_terms={query}&json=true&fields=product_name,nutriments

# 응답에서 사용할 필드
nutriments.energy-kcal_100g  → 칼로리 (100g 기준)
nutriments.proteins_100g     → 단백질 (g)
nutriments.carbohydrates_100g → 탄수화물 (g)
nutriments.fat_100g          → 지방 (g)
```

---

## wger API

- **용도**: 운동 검색 + MET 값 제공
- **API Key**: 불필요
- **Base URL**: `https://wger.de/api/v2`

### 주요 엔드포인트

```
# 운동 검색 (영어)
GET /exercise/search/?term={query}&language=english&format=json

# 운동 상세 (MET 포함)
GET /exercise/{id}/?format=json

# 운동 카테고리 목록
GET /exercisecategory/?format=json
```

---

## USDA FoodData Central (보조)

- **용도**: 정밀 영양 데이터가 필요할 때 Open Food Facts 보완
- **API Key**: 무료 발급 필요 (https://fdc.nal.usda.gov/api-guide.html)
- **Base URL**: `https://api.nal.usda.gov/fdc/v1`

### 주요 엔드포인트

```
# 음식 검색
GET /foods/search?query={query}&api_key={KEY}
```

---

## 자체 계산 (API 불필요)

BMR / TDEE / 운동 칼로리 / 권장 단백질 계산 공식 → `docs/database.md` 참조
