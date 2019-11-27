<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-12">
        <div class="iv">
          <div v-focus tabindex="0" @keydown="left_right_listener">
            <div class="row">
              <div class="col-sm-12">
                <div class="iv-image-holder">
                  <i
                    class="fa fa-spinner fa-pulse fa-3x fa-fw ergo-red iv-loader"
                    v-show="show_loader"
                  ></i>
                  <a
                    href="javascript:;"
                    @click="download_file(images[active_image])"
                    class="btn btn-lg btn-default btn-download"
                    title="Download image"
                  >
                    <i class="fa fa-download"></i>
                  </a>
                  <img
                    v-if="images[active_image]"
                    :src="require(`@/assets/${images[active_image].LINK}`)"
                    :alt="images[active_image].NAME"
                    :title="images[active_image].NAME"
                    @load="loaded"
                  />
                  <div
                    class="iv-arrow-big left"
                    @click="activate_image(active_image-1 < 0 ? images.length-1 : active_image-1)"
                    title="Previous image"
                  >
                    <i class="fa fa-angle-left"></i>
                  </div>
                  <div
                    class="iv-arrow-big right"
                    @click="activate_image(active_image+1 > images.length-1 ? 0 : active_image+1)"
                    title="Next image"
                  >
                    <i class="fa fa-angle-right"></i>
                  </div>
                </div>
              </div>
            </div>
            <div class="row" style="margin-bottom: 0px">
              <div class="col-sm-12">
                <div class="iv-thumbnail-holder" style="overflow: hidden;">
                  <ul class="iv-thumbnail-container" :style="{width: thumbnails_width}">
                    <li
                      v-for="(image, index) in images"
                      :key="index"
                      class="iv-thumbnail"
                      :class="{active: index == active_image}"
                      :style="{width: thumbnail_width}"
                      @click="activate_image(index)"
                    >
                      <img
                        :src="require(`@/assets/${image.THUMBLINK}`)"
                        :alt="image.NAME"
                        :title="image.NAME"
                      />
                    </li>
                  </ul>
                  <div class="iv-arrow-small left" @click="move_slider('left')">
                    <i class="fa fa-angle-left" style="margin-top: 5px" title="Slide left"></i>
                  </div>
                  <div class="iv-arrow-small right" @click="move_slider('right')">
                    <i class="fa fa-angle-right" style="margin-top: 5px" title="Slide right"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import $ from 'jquery';
export default {
  name: 'Home',
  data() {
    return {
      images: [],
      active_image: 0,
      show_loader: false,
      thumbnails_show: 8,
      disable_thumbnails_arrows: false
    };
  },
  directives: {
    focus: {
      inserted: function(el) {
        el.focus();
      }
    }
  },
  computed: {
    thumbnails_width() {
      let width = (this.images.length / this.thumbnails_show) * 100;
      return width + '%';
    },
    thumbnail_width() {
      return 100 / this.images.length + '%';
    }
  },
  async created() {
    await this.getImages();
  },
  methods: {
    async getImages() {
      let response = [];
      response = await axios.get('./index.json');
      this.images = response.data;
    },
    left_right_listener(event) {
      if (event.which === 37) {
        this.active_image = this.active_image - 1 < 0 ? this.images.length - 1 : this.active_image - 1;
      }
      if (event.which === 39) {
        this.active_image = this.active_image + 1 > this.images.length - 1 ? 0 : this.active_image + 1;
      }
    },
    loaded() {
      this.show_loader = false;
    },
    download_file(image) {
      const href = window.location.href;
      const img = require(`@/assets/${image.LINK}`);
      axios({
        url: `${href}${img}`,
        method: 'GET',
        responseType: 'blob'
      }).then(response => {
        var fileURL = window.URL.createObjectURL(new Blob([response.data]));
        var fileLink = document.createElement('a');
        fileLink.href = fileURL;
        fileLink.setAttribute('download', `${image.NAME}`);
        document.body.appendChild(fileLink);
        fileLink.click();
        document.body.removeChild(fileLink);
      });
    },
    move_slider(left_right) {
      if (this.disable_thumbnails_arrows) {
        return;
      }
      var image_slides = Math.floor(this.images.length / this.thumbnails_show);
      var $thumbnails_carousel = $('.iv-thumbnail-container');
      var parent_container_width = $thumbnails_carousel.parent().width();
      var carousel_left_position = Number($thumbnails_carousel.css('left').replace('px', ''));
      var carousel_current_position = Math.abs(carousel_left_position / parent_container_width);
      var left_slides = this.images.length - (carousel_current_position + 1) * this.thumbnails_show;
      var move_to = null;
      if (left_right === 'right') {
        if (carousel_current_position < image_slides && left_slides != 0) {
          this.disable_thumbnails_arrows = true;
          if (left_slides >= this.thumbnails_show) {
            move_to = -(carousel_current_position + 1) * parent_container_width + 'px';
          } else {
            move_to = -(carousel_current_position * parent_container_width + (parent_container_width * (left_slides % this.thumbnails_show)) / this.thumbnails_show) + 'px';
          }
        }
      }
      if (left_right === 'left') {
        if (carousel_current_position < image_slides && left_slides != this.images.length) {
          this.disable_thumbnails_arrows = true;
          if (left_slides + 2 * this.thumbnails_show < this.images.length) {
            move_to = -(carousel_current_position - 1) * parent_container_width + 'px';
          } else {
            move_to = 0 + 'px';
          }
        }
      }
      if (move_to != null) {
        $thumbnails_carousel.animate(
          {
            left: move_to
          },
          400,
          () => {
            this.disable_thumbnails_arrows = false;
            this.move_to = null;
          }
        );
      }
    },
    activate_image(index) {
      if (index != this.active_image) {
        this.show_loader = true;
        this.active_image = index;
      }
    }
  }
};
</script>
