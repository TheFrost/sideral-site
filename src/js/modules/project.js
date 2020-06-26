import { $, createElement, parseHTML } from '../tools/utils'

export default class Project {
  constructor () {
    this.DOM = {
      hero: $('.project__hero img'),
      name: $('.project p.name'),
      address: $('.project p.address'),
      date: $('.project p.date'),
      descriptionText: $('.project__text-container'),
      skills: $('.project__list.skills'),
      gallery: $('.project__gallery')
    }
  }

  init () {
    this.fetch()
  }

  fetch () {
    const id = window.location.pathname.split('/').pop()

    window.fetch(`https://sideral.mx/nuevo/wp-json/acf/v3/posts/${id}`)
      .then(response => response.json())
      .then(({ acf }) => this.render(acf))
  }

  render (data) {
    this.renderCoverPage(data)
    this.renderGallery(data)
  }

  renderCoverPage (data) {
    const {
      main_image: mainImage,
      project_name: projectName,
      origin_of_project: originOfProject,
      date_of_project: dateOfProject,
      description,
      project_type: projectType
    } = data

    const {
      hero,
      name,
      address,
      date,
      descriptionText,
      skills
    } = this.DOM

    if (mainImage) hero.setAttribute('src', mainImage)
    hero.setAttribute('alt', projectName)
    name.textContent = projectName
    address.textContent = originOfProject
    date.textContent = dateOfProject
    descriptionText.innerHTML = description
    projectType.map(skill => (
      skills.appendChild(createElement('li', { textContent: skill }))
    ))
  }

  renderGallery (data) {
    const { gallery } = this.DOM
    const { project_name: projectName } = data
    let counterCtrl = 0

    const keys = Object.keys(data)
      .filter(key => key.startsWith('image_'))
      .filter(key => data[key].image)

    keys.map((key, index) => {
      const { image, image_type: type } = data[key]

      if (index === keys.length - 1 && type !== 'type_1') {
        gallery.classList.add('even')
      }

      gallery.appendChild(parseHTML(/* html */`
        <li class="project__gallery-item ${type} ${
          type !== 'type_1' && !(counterCtrl % 2)
            ? 'u-border-right'
            : ''
        }">
          <figure>
            <img src="${image}" alt="${projectName}"/>
          </figure>
        </li>
      `)[0])

      counterCtrl = type !== 'type_1' ? counterCtrl + 1 : 0
    })
  }
}
