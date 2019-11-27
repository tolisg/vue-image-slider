import Vue from 'vue';
import Router from 'vue-router';
import ImageSlider from './views/image-slider.vue'

Vue.use(Router);

export default new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
        {
            path: '/',
            name: 'ImageSlider',
            component: ImageSlider
        }
    ]
});