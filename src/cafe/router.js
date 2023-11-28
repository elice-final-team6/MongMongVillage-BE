const express = require('express');
const router = express.Router();

const cafeService = require('./service');
const { imageUploadConfig } = require('../utils/s3-multer');
const cafesUpload = imageUploadConfig('cafe');

router.get('/', async (req, res, next) => {
    try {
        const getAllCafesResult = await cafeService.getAllCafes();
        return res.status(200).json(getAllCafesResult);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.get('/init', async (req, res, next) => {
    try {
        const initCafesResult = await cafeService.initCafes();
        return res.status(200).json(initCafesResult);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.patch('/:id', cafesUpload.single('image'), async (req, res, next) => {
    try {
        const cafeId = req.params.id;
        const cafe = req.body;
        const createCafeResult = await cafeService.updateCafe(cafeId, cafe, req.file.location);
        return res.status(200).json(createCafeResult);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// 메인 페이지 별점순, 별점 같으면 최신순
router.get('/rating', async (req, res, next) => {
    try {
        const cafeResultSortByRating = await cafeService.getCafesSortByRating();
        if (cafeResultSortByRating.message) {
            return res.status(404).send(cafeResultSortByRating.message);
        }
        return res.status(200).json(cafeResultSortByRating);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// 1. 기존 메인페이지에서 통합 검색은 애견카페 검색으로 변경
// 2. 검색어 기준은 주소 기준 (00구, 00동, 00/ 가게 이름 별 검색은 추가기능)
router.get('/search', async (req, res, next) => {
    try {
        const content = req.query.content;
        const searchCafesResult = await cafeService.getSearchCafes(content);
        if (searchCafesResult.message) {
            return res.status(400).send(searchCafesResult.message);
        }
        return res.status(200).json(searchCafesResult);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// 상세 페이지
router.get('/:id', async (req, res, next) => {
    try {
        const cafeId = req.params.id;
        const cafeDetailResult = await cafeService.getDetailCafe(cafeId);
        if (cafeDetailResult.message) {
            return res.status(404).send(cafeDetailResult.message);
        }
        return res.status(200).json(cafeDetailResult);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

module.exports = router;