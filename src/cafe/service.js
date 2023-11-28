const Cafe = require('./model/cafe.schema');
const Review = require('../review/model/review.schema');

exports.initCafes = async () => {
    try  {
        const cafes = [];
        
        cafes.map(async (cafeInfo) => {
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
                longitude: cafeInfo.longitude,
                latitude: cafeInfo.latitude,
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

// 카페 상세 리스트 - 리뷰 페이지네이션
exports.getDetailCafe = async (cafeId, currentPage, perPage) => {
    try {
        const cafe = await Cafe.findById({ _id: cafeId });
        const total_number_of_reviews = await Review.find({ cafe_id: cafeId }).countDocuments({});
        const reviews = await Review.find({ cafe_id: cafeId })
                                    .sort({createdAt: -1})
                                    .skip((currentPage - 1) * perPage)
                                    .limit(perPage)
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
            total_number_of_reviews,
            cafe,
            reviews
        }
    } catch (error) {
        throw error;
    }
}