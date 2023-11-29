const proj4 = require('proj4');

const Cafe = require('./model/cafe.schema');
const Review = require('../review/model/review.schema');

exports.initCafes = async () => {
    try  {
        const cafes = [];
        
        const epsg5174 = "+proj=tmerc +lat_0=38 +lon_0=127.0028902777778 +k=1 +x_0=200000 +y_0=500000 +ellps=bessel +units=m +no_defs +towgs84=-115.80,474.99,674.11,1.16,-2.31,-1.63,6.43"; 
        const epsg4326 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";

        cafes.map(async (cafeInfo) => {
            const [latitude, longitude] = proj4(epsg5174, epsg4326, [cafeInfo.longitude, cafeInfo.latitude]);
            await Cafe.create({
                name: cafeInfo.name,
                phone_number: cafeInfo.phone_number,
                road_addr: cafeInfo.road_addr,
                region_addr: cafeInfo.region_addr,
                zip_code: cafeInfo.zip_code,
                intro: cafeInfo.intro,
                menu: cafeInfo.menu,
                image: "",
                operating_time: cafeInfo.operating_time,
                longitude: longitude,
                latitude: latitude,
                rating: 0,
            })
        });
        return {
            status: 201,
            message: '카페가 성공적으로 생성되었습니다.'
        }
    } catch (error) {
        throw error;
    }
}

exports.getAllCafes = async () => {
    try {
       const cafes = await Cafe.find({});
       return {
         status: 200,
         cafes,
       }
    } catch (error) {
        throw error;
    }
}

exports.updateCafe = async (cafeId, cafeInfo, imageUrl) => {
    try {
        console.log(cafeId, imageUrl);
        const cafe = await Cafe.findOneAndUpdate({ _id: cafeId }, {
            image: imageUrl,
            longitude: cafeInfo.longitude,
            latitude: cafeInfo.latitude,
        }, { new: true });
        return {
            status: 201,
            cafe,
        }
    } catch (error) {
        throw error;
    }
}

exports.getCafesSortByRating = async () => {
    try {
        const cafes = await Cafe.find({})
                                .sort('-rating -createdAt')
                                .limit(4)
                                .select('_id name rating image road_addr');
        if (!cafes) {
            return {
                status: 404,
                message: '카페가 존재하지 않습니다.'
            }
        }
        return {
            status: 200,
            cafes
        }  
    } catch (error) {
        throw error;
    }
}

// 카페 상세 리스트
exports.getDetailCafe = async (cafeId) => {
    try {
        const cafe = await Cafe.findById({ _id: cafeId });
        const reviews = await Review.find({ cafe_id: cafeId })
                                    .sort({createdAt: -1})
                                    .populate({ path: 'user_id', select: '_id nickname profilePicture'})
                                    .select('_id user_id images rating title content');
        if (!cafe) {
            return {
                status: 404,
                message: '해당 카페를 찾을 수 없습니다.'
            }
        }
        return {
            status: 200,
            cafe,
            reviews
        }
    } catch (error) {
        throw error;
    }
}

exports.getSearchCafes = async (content) => {
    try {
        const options = [
            { road_addr: new RegExp(content) },
            { region_addr: new RegExp(content) },
            { name: new RegExp(content) }
        ];
        const cafes = await Cafe.find({ $or: options });
        if (!cafes.length) {
            return {
                status: 400,
                message: '검색 결과가 없습니다.'
            }
        }
        return {
            status: 200,
            cafes
        }
    } catch (error) {
        throw error;
    }
}