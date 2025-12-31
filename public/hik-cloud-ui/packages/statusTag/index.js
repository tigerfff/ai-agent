//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
var script = {
    name: "HikCloudStatusTag",
    props: {
        type: {
            type: String,
            default: "default"
        },
        color: {
            type: String,
            default: "rgba(0,0,0,0.40)"
        },
        imgSrc: {
            type: String,
            default: ""
        },
        title: {
            type: String,
            default: ""
        }
    }
};

var img$x = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAAXNSR0IArs4c6QAAAUJJREFUKBVjZIACh5szRf58+VrDwPDfhoGRUZ3h//+bDAyMR1h4uFsOqKe/galjBDFszvc7/P//fwVQkThMAk4zMr5kZGSMOGJYeAAkxgQyGadikAqgISEi+ht//Pu9GcRlgToD02SQLBDES5gzeAlr8+XcXPUaxGcCuTlCzJiBnZEFxEcBeTIODI4CagyZN1cw3Pj2Qg8kyQTyoByHIEO3SiBcEzMDI0ONvAeDJpcEQ87tVQzv/nwD+h8YEGANwNDoerSH4dnPj2BNfMwcDK1KfgyCrFwMBbfXMHz5+xOkDuQXYKiBncR4BMToeLQLrGmtTirDz/9/GMrubADTIDkIgKhjBIXS769fr4BCAxTGVvxKDMc+3mP4D1MHooFBy8rNrQOKDyYQAQpnkCBI0VEsikHysMgDRxzIEGJjGqSWJAAAqXCHp+uPwMMAAAAASUVORK5CYII=";

var img$w = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAAXNSR0IArs4c6QAAAPpJREFUKBWdUbFOQkEQnHkJEKHH2oqGjo6YCF8AhRobSv0KS36A0PkDL0EK+AIgoeRVVFTUJpYaI4Xr7ua2oAATL9nM3t3M7t4ckZYM2nV8fT/rtgPIleIOwjXKGDIv3hMNjERuWzMR6cU+kOQbwAdON0s7Y6r8AlYfIZ+vIrgJcqCLSmhap8zG8MpKBmt3JFZBDNT7Sxxg4yLT6Fjilc+IdJZr46nAH2j5X6KGcazDzpJYpztxb5zMrQt2whOipV1n7rNbl9gJjkWc46IytCv/B7lvdfGD3N041kEtnXNa9OPY3gBOigXMZ3CkthYaH0rcaoy18lOQ/4W/C75ltaFOkVEAAAAASUVORK5CYII=";

var img$v = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAAXNSR0IArs4c6QAAAS9JREFUKBWNkjFKQ0EQhr/diCiCNmpIY6FGCw+gGG2ChUWsRQgqxAN4EW8QG0kRsNTCQgIx5gRiE0SrEC0VVDDoOrP71gcBxWn2zcw3/8zuPENizjlTOOfAQcU4ljTsDLcGjtslqsZIVEx8WL9wuc8PahIpqj9oAjUyw5Rbm6ZnVfkvWItVyDPC2mSMH+WZMcj4vqGPlaO6BoUsRWWtzhxSAaxLaauUFm3Pwksfrp98p4qNF9Si8jw0e9B5htVpmByBvTwc3QRJZYeienYUdkRt/wry49J2EbqvcPog51ukwOrTqXsoD1m/h8d3GUnaL0zAinQ5uUthZa2+8/IUzIlqLUnqnXWM3Sb0v9ICZY1f2BmXv+0g4gI32ltsWN2gLkUDMTl4as4zwsp3sP/+Gt9xdWzKr8GuYwAAAABJRU5ErkJggg==";

var img$u = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAAXNSR0IArs4c6QAAARlJREFUKBV9ULFKQ0EQnFlDIPkGvyGlYMRCsJJEEBT0C0S/QX8jllYSsbEQCRaagNGIoJ2NoKAgFiIoigR9ybp7eHApnlvc7uzM3O0tkcR0SytZhjUoFkgcCtHo1niVSMClGy0+32NxoFg3YiolQ01cUrBVLGO3M8O+PN3h2sQ7qfi8ntgUEzrA9vcHbr0rSowndH5JlILB5n3IV40wQVeAoIchKiNjmC7F1QOAwIXbC7aJkyGw6s0YLk6x91XR9ixmaNsKMwe5QfyUyug4L6dzfLHcdPBPNI9n+eq8/B0bNuNbNIyMQ7yPAZuRC4ZunY8qWDbTZyRCJr5EseJ87AeDg16NR/bepJV79qe+rWXfbq6ezbMVxZ5/AVr4Tjfr5+n0AAAAAElFTkSuQmCC";

var img$t = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAAXNSR0IArs4c6QAAAWZJREFUKBV1UrFKw1AUvQlBGkrakLEY20I7CQ5NKKjf4CA46CDO+g26+BG6dxIXJxEXdVOEuHVum6G0KRlMrA0o1HMeCXTxQe4975xz333vEk1WVhAEW8vl8hTUvqZp98hXnucFKxbR+v3+2mKxOAB5hm93VczxO4qvHce5aTabmQHzB4RNipVKRWq1mpRKJcmyTMbjsSRJ0kXXbhzHl7BsGAjrhbler8twOJT5fC7ValVwogwGAxbRYjLoaDci4Mk0p2mqOriuK5PJRPHUC58O/EqC1+DJpmlKq9VSxbPZTPHUsd4YWPBEwDvbti3tdlvCMFTXKJfLiqeODs/MvBLBbxRFwjdMp1NltixLGo2Gejj0H3R+QRaNAfPvYRLH/0yJlp7v+ycEnJLAfI5Oe5iGnU+EdLE+AS6KDd8gqA6RDlH0VQh5/tZ1/SjXFaUKiPALPBqGsY2iW2wz5DuYdzqdzoNy5uEP3bmMlWHUW9oAAAAASUVORK5CYII=";

var img$s = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAAXNSR0IArs4c6QAAAKFJREFUKBVjZEADDuf7Bf78/78eJMzCyBh4wLDwA7ISRmQOSPHv//93M/z/bwIWZ2Q8w8rI6IqsCa4BQzHMJDRNYA04FWPRxEhQMZomlj///s0HikHcDJPEQjP+ZzD8w/B/LhMLB0csFnkMof8MDL9cDAtDmUS1RL+jyx41LmYEYXTxBkbGf0zogoT4pGtYzRj2lwEY1oRMZmRkOElIDVZ5AOw1RjYZks9LAAAAAElFTkSuQmCC";

var img$r = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAAXNSR0IArs4c6QAAAQhJREFUKBWNkj1ug0AQhWctU/HT0wENRTqElD7yMdw5yaGiuMsxIp8A6LagAQok9wgKqs17iE1MIkvZgpl5880M7KBkPcYYVVXVM+xJKfVAGb6Gf86y7B3WUFN8FEURQvgA8MT490Hugtwxz/PrDg7i+zCL2WhllCrL8gXCm+0aBIGEYSh1XVvp26LolRNOVvF9X6Iokr7vrbSxZHeoWj7Q8zyJ41iappFpmjagDcjubcDOjuNImqZW2th5nkVrLXuM0cg8dl0nSZIsE8Zx3MA3geYrnSkQatt2KXJd94b5cckqTODCPmGXHdy7JcAXLPDACWDNkQJ7DcPw50qZWxmzbJoghH/9Gl8vPox6jz8OwAAAAABJRU5ErkJggg==";

var img$q = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAAXNSR0IArs4c6QAAASNJREFUKBWFkr9qhEAQxmc1CIqIhU1EtFRIJz6B5DGuuyQPFXLdPcZxT+Cf6p5AJHaClVfIZr6NK5IrsoXz7be/cWccBa1LSimapnnjeBRCvMBmfWN9yvP8i6OEJ/CoquqZjTMDJfZ/F59d+exQFMW3wYL3v7DjOJSmKSHuF160MkLUdf3Oxqdt2wo2DIPatkU5+xylOekDNxyxC8OQTNMkNlV8oNkAazCgGnRdd2N839/0XoA1tLEsi5YURdFDH/oQJd2wmaZJe6qkLMsoSRIKgoD0jWBR0glk3/d0v9+3JPQCOI5jsixL+WAFZ2FgF44lmkbznucpaJ5nGoaBxnHEx7jyAF+fWEge3IHjmfsou67bbtECML8QjFSTxsF607+/xg+ajYlFOaMsCwAAAABJRU5ErkJggg==";

var img$p = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAAXNSR0IArs4c6QAAAWZJREFUKBVjZMADjM/MZBVm5WSzWn/ve0NDwz+QUkZs6hv+/2fac76/leH/fx0GRsYL/xkYdBmZmHuOGOQfwarB5nxvy/9/jC+OGhdNARkY+n8V8/NzT5b9/cmQgM0ChrT/M1lhCkG2gdi25/ozbc9O0ANz0HXNYkz/7XC+X+D5+cc7D1yapAWS/8f4X5Wdg/EDWIPD/fkcNmd7p8BMc748Qfz3v/+bGBkYmw/o51+xPTfRmfE/g/ge7fxHYA1/3r+bCvT/2QZGxn9O56bI//j9bz0jA3PhYaOigyDT/zP89eRiFkkDsRka/jcwWZ/t2wliu11cxG1ztu+43dl+TRAfKwCFgPW5vukgyf///zOCnIdVIUwQpMj6XO8pvxtzeWFi1mf7g2zO9fXA+Mg0OB6sz09wZfz3rxkYgMeA1igDBd8ISvDkbpZK/4asGMSGR5zn7Unsn7/+lmdg4nx9RC/rPbpCGB8AE/6PBuCA6nEAAAAASUVORK5CYII=";

var img$o = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAAXNSR0IArs4c6QAAASRJREFUKBVjZMAD/scYSzL8ZBJnYFC4xrh69S+QUkZs6v+nGbMyvGWYyMD4XxCo5CpQjQkDA1MX45rTx7BrCDHuYGBkvMq4+sxikIH/Q0OZGf7dW8PAyxuJYsH/EKPF/8ONlVEEoZz/IcbF/0ONdZlQJBnZGxn+MCzBoUkdqPYjWANQJz/Q9CrG1cfvMDCxxaJrAsr5MPz/z8e4+uwjiA3//89jYGI+BbINuyZGKwYukWSwa/43NDD9DzZaBOYgEf9DLVX+BxsfR3ceE8PVq4zAwH2OpBbMhNv09/9ccDDDFPz//58RGAJ7/0fZAMMcAv4HmxQCxbJAPBTFQD44Hv4Hm2ozMPydAAz7p0AxeaAHjzLo+tUxNjT8A2nCCUC2oJuIrhgAX2VrERJW/mkAAAAASUVORK5CYII=";

var img$n = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAAXNSR0IArs4c6QAAAUtJREFUKBVjYCARMCKrt73WL8n467/u378MaoyMDOxM/5mesLIxHNirW/ASpg6swe5Sn+6/3ww1QEFNBkaGjQz/Ge4xMDL++c/AoMDw/78rUOwzI8P/qiNGxRcZrc/1JQN15TEz/S84aFC8H2YSMu1wrs/kD8P/iYyMTPNZGBkY+YW4+Gw2aSR/tjs7Ifwf4z8/oGJDoMnfGBgYH/1nZlhxwKBolcP9+c5/339IBTup4f9/pj3n+7cCFb5j+s/Ycsi48DrIBruz/Zr/GP4XAJ0kK2ko47uaMewvSBwMbC5MUQMx7C72O9mc75tnfa53tv25fkuQmMP5fgUQDQJgGyBMoMTFiTp//vzNZWBhmsf47z8L0FmprAxs9fuMch7C1GClfZ/N5HK7uIgbmyQLNsH3L75uZGD4CpJzRJfHqoGZmaHp318GJnTFZPEBIzVubMsIaFkAAAAASUVORK5CYII=";

var img$m = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAAXNSR0IArs4c6QAAAUxJREFUKBWVUbtKA1EQPbNZEiMSERsbQRBTCUJ2Eyx91Nps1lgKopJGgl8QrC1MZyEGRIgkplBIZaGgFr469QtsTGFh1MC62XF2wxWEbTLNPM65c2buAD0a+Xy20yPgzgQo9gx2TBAlwRwDaa/QtUuq3L6pvloQRCJ9YNqF5ywJOS3xl/gm2Evix62xZTQ4l5nyucS2uSpAHnp8EW77FBwpUf3+SHX0PVsZUXVLQi/rkg4iEZ+lg5sWZ1NbIG+Hs0ZC6oYQhmS0Y6rfVXllZh6frbXuDsWihqezhhCaiMYLcL4bYJShR6/hOgUQRkHjC1Srdf6UZcZkIG+n5jhrbojKFdtGPqgtT48pYqCgEs6Zk+jwpiy8Dwy8wPvwVStUf9xTnH8PVJHXjX60h7tY+92ik4dDhYV6tlLnMtJFGCi/FGKEbTla90YhcE+lX1zgcSGdEnsSAAAAAElFTkSuQmCC";

var img$l = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAAXNSR0IArs4c6QAAAWJJREFUKBVdUc8vA1EQnnldtAk3pDc9knQrGzQRFxJ/gIO7SDTon+DCiToR0a6DH+lJ4irO6iYODku4aELTkxDSEEKzY2Z2V9Q7vPfNN9+b+d48hHDR3lgXfDaWOBwBBEtpgip0tK3h3OVdpEMB5A5mwfe3wNA69Hcf40SlGfIOkL/BuIz5qwPhQCpT0T4nN9OrxL+NTsctzp9QyR6SlFEbXBkXvcdIS256M8LarR3nOS4IZ9hvVmxEAtpJD4NvXqNYTsx5dSBo0tFownAcizyriEwN0J9S3Lrdwsv7gFxoWYE1bOmgAqQ+iMcfDLeq8pQcIWnf6WH/y0CUomJmRe0Jz1b4SOLMxbMlc4av712exiR8JBpwX6+AiZ1JAS5W0/PpbRWM2RYc/EPJnuXkNPA09IGqCiuLGKgT89e53wsCwjkXZBpc5oaZFNNJqYwL3qFoZGmHAAa7+uVpyAPF89+c4B8ayIhX2qIWdQAAAABJRU5ErkJggg==";

var img$k = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAAXNSR0IArs4c6QAAAYpJREFUKBVtUbFLQmEQv3tqIVZDSxCBS0HYEj4tyqUpgmp6flJGQwZO2dbU0IMggiL6CxoawlChgnCItoRKa4yWTCSacgihsuRd9336pKEb3v3ud7+77+4eQtNITHSAVV0HoAAgaoomKEO7tolH+aKta/AiMEKGfkVh/wwRoZ0kIzhEhv+CjEDM5oBioU4W5kiMdbfIP4BMU6OwfkLCryuag22KBGdlQCI4RdHRAYUXJz3cPaLwXKhXviQxz8oz+6bPZcBhGb7rx1w4DB+VDKBWlSwmc6+8V424iVzOiaZpqUTq5gEIl8Gy8tzqFNOFrOSb9ghfb4MaC5RYkiREGyBtAMI+WJSwx2sWeMHtLMkXimoExT7HeYAspu/W2C9B7WdV0nwQN7sePLytAEXHvbz4JXd3qJp/PnzFPYoEDJlSN2digeE8OF0rmLwu2TVySfisbAGRhpn7RKtAAhKjPrDqO4x4D3jiBn1Md/F1djFVOJMaaa2/2ghZHtdd8O7qB4/jBQ9y6qx2Tvpfq9qPO5EN8tgAAAAASUVORK5CYII=";

var img$j = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAAXNSR0IArs4c6QAAAWRJREFUKBVjZICC////M9pd6Ev5/48xCSjExsDw/z8DA+NvRqb/8w4ZFM1hZGQE8oEiIML2Wr/k/x//5wKZhzj4uafvUU7/CBJ3uTuT/8fHr5lAph0jB2PyYa3C50Bz/jPanOvb5nCuzwSkCBsAyYHUgNQy7wvgSwVa9PqQUdEqbIpD/69i/vv+0/fffxlEFrw8rskCcjMvH4s7NsWetyexPz//ZAkjw/8VHPw80398+LqDCeg51u2qeZ9A1oZeXQX0LAT43ZjL+/nznw1M/5nWHDYqXgvx139WFpiCP4z/FZ//eFIF1BTxmuU937uvH9cw/GfoOGRcsAOmBkQDbWD8DbSa74hh8WomJsa1z38+WfPny9fNwGCsPmJcBFcMCjGQWiZQOAOtzgLpPmRYuJSJgWkOEytD2mHDwqMgMRgABS9ILcnBihFxvLws00CBADIZW8SBNYAkUZPGf1aQGMjN6EkDAKzQvPsmIdgoAAAAAElFTkSuQmCC";

var img$i = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAABSklEQVQoU2VRO07DQBScF2THFChQ0vkGrNOwKSKFG0TiAFDSIKWligtEi48QTkJSILvCG7hA6OiCoCCJwYPWxsbAK+d9Zt6MoFGbbm8E4gQCVcCEARm5JrmpxqTAldrNZPuWwFOLjByTTC2eKT2gIASk4/D9SIx5KRY2gTYg7KVJk5FK+1kLYxIDAF47TfbFyrBAO42H1XDJ6F2B6AtwbhnXwaERSiT2uhCjSkbNKHIA8tVNk86PPLm2DHTv40Ja+Y/2P3PqfEvOCPHbaexXPTv7b2Ed9BbCfIkWZk4ukZhk8XuhIen7yQdAdkDO3TQp7QXwoXrDXBgWT+c5jz2T9AsbwUuIPDpcXVgb6+uBnoKYlLYq/QzwDSJ3DhE2Zdj+uqtDIYaWsRGcZ8NaCiR00njWCG4MYM/halAHV9MqfQrBCNbSwjLO/wb6BRUstr/ki3nbAAAAAElFTkSuQmCC";

var img$h = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAAXNSR0IArs4c6QAAAORJREFUKBWNUkEKwjAQdEPxD77BWyl4F59RvFR9hoee7BfEXsRnSF7Q5tY3+AcPiTMxC6UoNJDM7swk2W0qizRCCOKcOwArEVmTRjwgbvM8vwEDOeHSdd0KxAOGLfPpgGahlUVRvAwC5P/N3MyDkkek7/sjiCsFkG/Ms/f+ztwYs4dWYy6TfsqQVEw4aEa9zTeLa4O+eMOFGb0GptggCT2ZsY4xR69RYS6y6UHNrFljxTFHb4ZrWgQbGoA1a9YytGndTK/AxAd7An++wchs8UF2bBreUAKtilOkljwhvjQNIGb9Gh/HHZKWdTnVswAAAABJRU5ErkJggg==";

var img$g = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAAXNSR0IArs4c6QAAAQRJREFUKBWVUjtOA0EMtc1QUKSkokqXDrQp2QjlADQ5AEeIRMUZqBA5AgegSY0ihFKyynZ0HCBlihRZxviZNRIrgYKLnXnPzx5/lqk1VeVRNSuYmoKEj53OulZK1UsxrZhZwTE+52+3vYPt4SRn7QN3TYTfP452j8vBzUaQ+S8xgpEIGmi5fL0fEjWXcDCLKNNYcz51LFJbIQs1ApgozRNq9uIMtuLSfcA5lyRiF3oCB618N/gl8MxwhsVrjm0YFv4/E7LRRYi1UMc9zh+caRPmbE2fQIAGUXOUAbE33UZDyxjVxeru6rcdxEvYxfPZ9YNgg1gKiHB2z1gctL5pCPDSPr/GJzI6gelIe8YoAAAAAElFTkSuQmCC";

var img$f = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAAXNSR0IArs4c6QAAAPNJREFUKBVjZEADntv+8334y1ABFDYA4gsCzAwd270YP8GUMcEYIDrtzH9WoOKNjEwMJ5kZGaJBNIgPEoepY4ExQPSVZwx+QGrrMW/GjVDxjZab/qtCxdeCxFBsYGBk0ATi81DFEArEB4lDAdwGkLVAk3iATuGy2fJfEKaA4T8D17//DDwg+VkmjL/hGq48Z7jxn4FB6S+QACrCAED5UKCgMtxJ//8zKKGpOorMh8nDNSBLgthAp9Wgi4H4WDUwMjC8Arr1CohG14RVA1AR128GhlQQja4B7mlkCaCfeYBubkMWg7HhNjAyMpwGCv7ChaHyDACmI0tMIDuUlgAAAABJRU5ErkJggg==";

var img$e = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAAXNSR0IArs4c6QAAAOdJREFUKBVtULsOAVEQPSOLRMRfKFAQCn+h2k7NNyjU4kd0q9hCSacQ4pHgI1SiE48xO9fdrGunmDNz5pw7k0twgrvtEu7PAcANgPbIe2OarG5WlrFFhNxvZUUcinCFXKGrKL3yX6GXNOBKHbHNKNiISSNkv1U2PKYR87MBb64ItTNam6VX3vS/G0DS88tKI6RgPWfmBYiUNllK9psnZlSVTUmiP1OwrcUnuWICLZM+O48NyaHWRMM/TohUg9x5QZaPio4r1QBCAQ/0FB2D80tmKvcW5RtGjlbb2CDr1/JiPU2kHOMQ4QdmOUL+ij7vagAAAABJRU5ErkJggg==";

var img$d = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAAXNSR0IArs4c6QAAARVJREFUKBWNkqFOA0EURfdNiyKpq+AHMHWbdTjgC4CgNqFJgZAK/gDDN6AamkCCQeKhBuTuVlXxAaj6uuHczbymRTHJ67vv3DszTaeWpRVjtKZpLukjMxsIoxfoaZ7nj/QoZvqoqmoP8ELgUPPfhTfDK4ui+AkI5q3wVwjhgjoT12YdlDJmdV1fASbp1DnGOfMTfUXdou+pU/nM17phlMIZp76iS+oAfkQNqU/3le2ya4BoGf0OsaMBLvhBrQ9UtivTFxt2XdNvqD51ssEyfaXFJkj6Df6NfqY67isbuGbqwDtsiR4TCM7UlTWgHuydvn4DjIq5R2bfN8BmPOCxbsCLpYCbzA9o/WLtkpcysX1pUcC//hq/4D+e5E0pcpkAAAAASUVORK5CYII=";

var img$c = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAAXNSR0IArs4c6QAAAR5JREFUKBVjZEADly5dEvz9+3clUFiPkZHxHC8vb4eqquonmDImGANE////n/nXr1+LgcxDTExMEUANJz9+/LjxzJkzrMjqQApZgIIVV69eFTp37lwEsiRQvAQoFgwTY4Ey/gJp8+/fv5sD6TCYJIgG2nQeSFnCxMBOAlr9HygAU7gK5ITbt2+zg/wDtJ3r379/PCAxkCa4H4Ca1rCysqZDTVr17ds3fqB/9gI1bAKKlQPxDZAcXANQwg8YOjtgmoDsmUC2B1ANyEkgoAQi4BpAHCAwJKAJQwNM0zwgA+wndJvQbQBpYAD6xx5I5WFxHgMjWAWQAIYCKKTQwXmQP0C2QCXC4DYATT0NxL/QsPafP382/v37NwUo/gUYJ5YA0kqF+88E5BEAAAAASUVORK5CYII=";

var img$b = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAAXNSR0IArs4c6QAAARFJREFUKBVjZICC////M549ezaZkZExGcjWBtKMQPoakJpnZGQ0C8QFKWUEET9//my8c+eO0/fv321AfCxgPxMTUwxQ4zMmkOTDhw89VVVVbXh5ebGoBQs5/vv3bynIFcznzp1L/vHjR+bXr18ZlJSUGL59+8bw69cvbBoVXr58+YIJqCsJJPvlyxeGe/fuMSgqKjLgsgmoNhmkQRtmHCFNQLVaYD/ANCDbBHIeDw8PshSYzQQMrqvooiCb7t69y6CsrIyiCaj2GkjDPHQNID42TUC1c8HxcObMmV1ANa7YNIKcBbLpwYMHF1RUVIzAfuDk5IwD6t6DTQPIphs3bhyTk5PbApSXA9sAUggMAaKSBgCF+Yg0tQF2QAAAAABJRU5ErkJggg==";

var img$a = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAAXNSR0IArs4c6QAAAO5JREFUKBVjYMAC/k/Xrfg/TacSixQDI7rg/+l6Ygz//t8DizMxKjFmXnqFrIYJmQNm/2OoZmD4zw3GYDaqChQb/k81lWVg+H6bQTeKHazs8rKfDAycqozZpx/DtKHawPi9HijBzsDBzwDGIDZEDKaeAa7h/wwDVYb/jPFwGRgDKAaWg/LhGhj+/WkCupsFpg5BA8XAchARsAZgEOoBueFwRT8+MjCAMAKEQ9UwwExsYfiPFMS3tiKUglggOUaGFiDLj/H/ND0Lhv//jqOocOmAcPdUoAgzMDJZAm34j3AKTPpwO4yFRmNRi6YCgwsACxtChFmQuEwAAAAASUVORK5CYII=";

var img$9 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAAXNSR0IArs4c6QAAAOtJREFUKBWNUqEOwjAUvDYhQcwisEsIIXOAhxB+AYcbH8AHMYeCXyALeAJqBoFB4FBIknKv7TYIg1DRvHfv7vW1VwW/jIHCATMYxIwiCxtkjBN0sVCKFS4lm9mjyWhJaCT5x1JIWZuqPq7adv5FFrU0Ike42o9R3TkYAp2jO1BEHFlTHTuEe3QqQgQDIFwBl3mJkat5lLugwPWWK1ryGjhPgPuuFJCry8xH38i+LCNlb6KwonNOIFdGSvIcjxtQawDtLdDjs7/eSUjkKm/Yxj5doawIxIsuxto6SFOoTitoDsqNo9vWaUH//RpPHARPsbu9KocAAAAASUVORK5CYII=";

var img$8 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAAXNSR0IArs4c6QAAAQ1JREFUKBVjZICC////M9pd6Ev5/48xmYGRQRss/J/hKiPT/7mHDIrmMDIy/geJMYII22v9kv++/1/CwPDfCcTHBIz7mDgZYw5rFT5nApmMXzFI+38nkBqQWkbb872p//4xzIKZulwrkUGWQxDGZfj05zuD16XpYD4TE0MaC9jNDGDngQUjr80H0wY8MgzNij4MgqxccM0gtUxwD8KFGRhgimvvb0ESBTKBgcGEKoKq+MKXJ+jSDExA11yFiRpCnQEyGab48Y/3MGmg3xmuMoHCGSaSJ+PAgKwYJA7zE4gNUssICiqbc/17cMcBSCkIMO47YlTowgSKQVCkgAQgEthISMSB1IJjGqSE2KQBAGjcd7rf05UuAAAAAElFTkSuQmCC";

var img$7 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAAXNSR0IArs4c6QAAAP5JREFUKBWNUi2OwmAQfdMg1m2QGA5AHeUEhAsQWFcBYcGtIuEQJCgcAYeDhAuQPQHFwQHWoMka3DAzX/vRNIHwRNuZefP7SkjBzIRu9A2iAcChc9MJzCtskyURsfpIHxxHFdywlqSm2kUI+RcfiGmdXAKr/IKsyVbIcaRPpz6UXgtfdb4DVare5P8r0HeNZZxRyWZmG8+Rftowq1YHxlPQZ9nZGpX9gseCviiQkjGb5Jz6yaEkFJAnn4+FICAJcroMYWRjWOWUzJe/LCpvOgV258zVGyNPNrfs5CGakJ31q7F/pkFGNi02h1ZgCqooKs4TeOFEBVNaedbpjV/jDs4Oao/gLXSvAAAAAElFTkSuQmCC";

var img$6 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAAXNSR0IArs4c6QAAARNJREFUKBVjZICC////M9pd6Ev5/48xmYGRQRss/J/hKiPT/7mHDIrmMDIy/geJMYII22v9kv++/1/CwPDfCcTHBIz7mDgZYw5rFT5nApmMXzFI+38nkBqQWkbb872p//4xzMI0lYHBkEeGIU/GgSHxBtByIGBiYkhjArsZqnq5ViKUxcBgAFTcpOjDMPHJAbgYSC0T3INAYVkOQbAkSHEzUHHt/S0MF748gWsAqWVC8CAsnIqhCpkYgEGHrAmryTAFQLUsoHD+/4/BHCT26c93BkFWLoYpamFgJY9/vGeIvDYfppwBpJYRFFQ25/r34I4DmHrGfUeMCl2YQDEIihRgHO6DSWHSkIgDqQXHNEgBsUkDAHfLeH+wZmCiAAAAAElFTkSuQmCC";

var img$5 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAAXNSR0IArs4c6QAAASpJREFUKBWNkj0vREEUhp+ZDZqNjkSh1SgoBCEKKoVeo/P1B7YgFDoKv0CsikJNoVoFIhEhItugExEFEkHhY8d57+xEchOJt7gz551nTs6ccx11hRDc4C5TASZdoFN2cFQdlI/GWHfOXJPFMLQX2r4/2DRnRHFeBlUKjUwcjLp7r8x5uK8F5rugwcerSpQxxrqBnTAdAmspa38rLPdAUwGOH2DuFD5r8dQ5ZrxqTnBHMyx2w8YVnD/C2xcsWJwk1qcHyrx7h9lDqD5DzU6XzmDrJuKrvfZga0a9Stgejhl1KUmVXL/EqHQSV6/WadtejEb+q0RJYr21rCzj9jXZf69ifTYU6/P4/i+oUvQGKfkGV8R6TVBDkRERuHyClYsUZdPNBifWuKj//ho/+bFzK31yXoQAAAAASUVORK5CYII=";

var img$4 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAAXNSR0IArs4c6QAAARRJREFUKBVjZICC////M1pvYUj5z8CQzPifQRsk/J+R4SojA8Pcoz4McxgZgaJAAOQzMNju+C/59xfDEqCIE4iPDoCK9jGzMcQc9mB8zgQyGV2xEi8DQ6kuQhvIILAaoFomqDOcVjoiFAiwMTDI8UD4MHGQJpBaJiAjGSQlC1WA0IbJAqllgnnw8RdMBSCR8P0IcZBaJhgXWQImhkz3mEF4TKCgg0kYCDMw9JkzMHAyQ0QcJBkY2k0g7JJTkGBmAoUzTMOFtwwMr38wMJTrMzCAQqpYByh5CyYLjoO5jOAI28ywBxQKMKlKoAY7CQaG3OMMDHc+QURBcXHUl8EFSGOPOC4WBoZvfxCKYREH1gASJjZpAABoBGay6R5yagAAAABJRU5ErkJggg==";

var img$3 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAAXNSR0IArs4c6QAAASlJREFUKBWNUrtKA1EQPXMFkyKV4iPBwtrtsn7B4ifELp1+gQFthVQKWlrFLp1+guwXGCsfjYiV2ghCLBKbcc7c7EYiiAN3d+7sOefOnrmCSaiqoJXuQmQH0CSW5Q6q57gc9EREWRM+tJ3WMULfSBn3s2HgHFW0pT94Da5McKWaobE+iwVrOl/JJoIS2IYrL6wA3R6w0ZySkjTWFletMzvdsHOHSePMEGsYfgCPt0DnOL6X6jE/2QeeHlzEWlsWbTWHqqiVslTdO4pbgu9vyk8i+AzlrkiM/VcYwawrgv2zJSpzMf/5T4YN7jMJdKgAsw2u04NYK9yzmYjbur155bbSqZdn0qdB8Psb5Guc4+J6K/gEOZTxKP8FJs0EHEyMTdsnzbqf9I+r8Q0yqX40n4iApgAAAABJRU5ErkJggg==";

var img$2 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAAXNSR0IArs4c6QAAAQ5JREFUKBWVUTFOAlEQfbP7gQuYcAQaCmQpKfYAVlYkJJ6AhI6QKB0U2JF4AhMTKysPQEEpaCEhHMHECyyyfv4bdowl/GInM+/Nm7czguL5JL3YY3fnPdoC1DywFcHCoTyW5fzbeAEDflrtFD5/DuSqARZD0xck7pTeFnPW5KicfSq5UgaynXGBImeTQ6XOSVFho0rQvb5Amg1tkORSc9YpRh4BR8/KCMr5cIT4foLfxydEN13kg9u/icaL+IPaED5++a7kuN/T6FcfBsF4EbdhVdpR5dmDRrNH3HiOqwvjEnqNp2O1QWW/3mi+v7pWW+Sx8fwt6VHCnnXf/1dKuZBrnXhxPD0csVMvTe5Z7wAKzIox2GoNcwAAAABJRU5ErkJggg==";

var img$1 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAAXNSR0IArs4c6QAAAM5JREFUKBVjZICC/zONRRj+/axh+M9ow/D/vzoDI+NNBsb/RxiY2FsY08++galjBDH+TzdwYPj3dwWQJQ6TQNCMLxmYmCMYMy8cAIkxQUxGUxy1BaEeZAjQMLA6kAawM9BNFpBH0gBigjQBnQsETGA3g1iEAMhvQADUAPQgMQCqjgkcGugaPjxEF2GAqQNqAAYdOtiahS4C1ABRxwQKZyDvJVwFvxwDQ/RWBgYQDQegoAWpA6oEERjxAFL88RFICghQ4wGsASRMbEyD1JIEAPXEVNqsDGTdAAAAAElFTkSuQmCC";

var img = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAyklEQVQoU5VROw6CQBScMdGGxiNYq4l4AvEmWkMinkA9gRRaqycRbwAF1h7BhkYTn4Hd5WOiwU222Hkz8/a9ISpH9v0ZwAVAW8ESQRDQS06Gxhze9rroWOeSWLXRwkc65fJ2V4LdIAI5+qTV3xLRTcZU32gdfpNN9TVnM3cjkIiyH0rFfQNgBeCisQkAg+VQXSASgPQhCFUVDoC1vlrQaGDdTyT+f+jGa83cvcQug2tb4dcsRGI8U6cIrlhalonQL4QZkRLQvR4N5w2yDVLjT2/tMgAAAABJRU5ErkJggg==";

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */ , shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
    // Vue.extend constructor export interop.
    const options = typeof script === 'function' ? script.options : script;
    // render functions
    if (template && template.render) {
        options.render = template.render;
        options.staticRenderFns = template.staticRenderFns;
        options._compiled = true;
    }
    return script;
}

const __vue_script__ = script;
var __vue_render__ = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c('div', {
        staticClass: "hik-cloud-status-tag"
    }, [
        _vm.type === 'enable' ? _c('span', {
            staticClass: "hik-cloud-status-tag-span"
        }, [
            _c('img', {
                attrs: {
                    "src": img$x
                }
            }),
            _vm._t("default")
        ], 2) : _vm._e(),
        _vm.type === 'disable' ? _c('span', {
            staticClass: "hik-cloud-status-tag-span"
        }, [
            _c('img', {
                attrs: {
                    "src": img$w
                }
            }),
            _vm._t("default")
        ], 2) : _vm._e(),
        _vm.type === 'intelliVal' ? _c('span', {
            staticClass: "hik-cloud-status-tag-span"
        }, [
            _c('img', {
                attrs: {
                    "src": img$v
                }
            }),
            _vm._t("default")
        ], 2) : _vm._e(),
        _vm.type === 'defence' ? _c('span', {
            staticClass: "hik-cloud-status-tag-span"
        }, [
            _c('img', {
                attrs: {
                    "src": img$u
                }
            }),
            _vm._t("default")
        ], 2) : _vm._e(),
        _vm.type === 'nodefence' ? _c('span', {
            staticClass: "hik-cloud-status-tag-span"
        }, [
            _c('img', {
                attrs: {
                    "src": img$t
                }
            }),
            _vm._t("default")
        ], 2) : _vm._e(),
        _vm.type === 'athome' ? _c('span', {
            staticClass: "hik-cloud-status-tag-span"
        }, [
            _c('img', {
                attrs: {
                    "src": img$s
                }
            }),
            _vm._t("default")
        ], 2) : _vm._e(),
        _vm.type === 'out' ? _c('span', {
            staticClass: "hik-cloud-status-tag-span"
        }, [
            _c('img', {
                attrs: {
                    "src": img$r
                }
            }),
            _vm._t("default")
        ], 2) : _vm._e(),
        _vm.type === 'sleep' ? _c('span', {
            staticClass: "hik-cloud-status-tag-span"
        }, [
            _c('img', {
                attrs: {
                    "src": img$q
                }
            }),
            _vm._t("default")
        ], 2) : _vm._e(),
        _vm.type === 'connected' ? _c('span', {
            staticClass: "hik-cloud-status-tag-span"
        }, [
            _c('img', {
                attrs: {
                    "src": img$p
                }
            }),
            _vm._t("default")
        ], 2) : _vm._e(),
        _vm.type === 'unconnected' ? _c('span', {
            staticClass: "hik-cloud-status-tag-span"
        }, [
            _c('img', {
                attrs: {
                    "src": img$o
                }
            }),
            _vm._t("default")
        ], 2) : _vm._e(),
        _vm.type === 'wifi-online' ? _c('span', {
            staticClass: "hik-cloud-status-tag-span"
        }, [
            _c('img', {
                attrs: {
                    "src": img$n
                }
            }),
            _vm._t("default")
        ], 2) : _vm._e(),
        _vm.type === 'wifi-offline' ? _c('span', {
            staticClass: "hik-cloud-status-tag-span"
        }, [
            _c('img', {
                attrs: {
                    "src": img$m
                }
            }),
            _vm._t("default")
        ], 2) : _vm._e(),
        _vm.type === 'fault' ? _c('span', {
            staticClass: "hik-cloud-status-tag-span"
        }, [
            _c('img', {
                attrs: {
                    "src": img$l
                }
            }),
            _vm._t("default")
        ], 2) : _vm._e(),
        _vm.type === 'abnormal' ? _c('span', {
            staticClass: "hik-cloud-status-tag-span"
        }, [
            _c('img', {
                attrs: {
                    "src": img$k
                }
            }),
            _vm._t("default")
        ], 2) : _vm._e(),
        _vm.type === 'normal' ? _c('span', {
            staticClass: "hik-cloud-status-tag-span"
        }, [
            _c('img', {
                attrs: {
                    "src": img$j
                }
            }),
            _vm._t("default")
        ], 2) : _vm._e(),
        _vm.type === 'pusing' ? _c('span', {
            staticClass: "hik-cloud-status-tag-span"
        }, [
            _c('img', {
                attrs: {
                    "src": img$i
                }
            }),
            _vm._t("default")
        ], 2) : _vm._e(),
        _vm.type === 'success' ? _c('span', {
            staticClass: "hik-cloud-status-tag-span"
        }, [
            _c('div', {
                staticClass: "hik-cloud-status-tag-span-icon",
                style: {
                    'background-color': '#02BF0F'
                }
            }),
            _vm._t("default")
        ], 2) : _vm._e(),
        _vm.type === 'danger' ? _c('span', {
            staticClass: "hik-cloud-status-tag-span"
        }, [
            _c('div', {
                staticClass: "hik-cloud-status-tag-span-icon",
                style: {
                    'background-color': '#FA3239'
                }
            }),
            _vm._t("default")
        ], 2) : _vm._e(),
        _vm.type === 'info' ? _c('span', {
            staticClass: "hik-cloud-status-tag-span"
        }, [
            _c('div', {
                staticClass: "hik-cloud-status-tag-span-icon",
                style: {
                    'background-color': '#3A93FF'
                }
            }),
            _vm._t("default")
        ], 2) : _vm._e(),
        _vm.type === 'warning' ? _c('span', {
            staticClass: "hik-cloud-status-tag-span"
        }, [
            _c('div', {
                staticClass: "hik-cloud-status-tag-span-icon",
                style: {
                    'background-color': '#FF8F4E'
                }
            }),
            _vm._t("default")
        ], 2) : _vm._e(),
        _vm.type === 'default' ? _c('span', {
            staticClass: "hik-cloud-status-tag-span"
        }, [
            _c('div', {
                staticClass: "hik-cloud-status-tag-span-icon",
                style: {
                    'background-color': 'rgba(0,0,0,0.40)'
                }
            }),
            _vm._t("default")
        ], 2) : _vm._e(),
        _vm.type === 'unusing' ? _c('span', {
            staticClass: "hik-cloud-status-tag-span"
        }, [
            _c('img', {
                attrs: {
                    "src": img$h
                }
            }),
            _vm._t("default")
        ], 2) : _vm._e(),
        _vm.type === 'using' ? _c('span', {
            staticClass: "hik-cloud-status-tag-span"
        }, [
            _c('img', {
                attrs: {
                    "src": img$g
                }
            }),
            _vm._t("default")
        ], 2) : _vm._e(),
        _vm.type === 'encryption' ? _c('span', {
            staticClass: "hik-cloud-status-tag-span"
        }, [
            _c('img', {
                staticStyle: {
                    "margin-top": "-2px"
                },
                attrs: {
                    "src": img$f
                }
            }),
            _vm._t("default")
        ], 2) : _vm._e(),
        _vm.type === 'unencryption' ? _c('span', {
            staticClass: "hik-cloud-status-tag-span"
        }, [
            _c('img', {
                staticStyle: {
                    "margin-top": "-2px"
                },
                attrs: {
                    "src": img$e
                }
            }),
            _vm._t("default")
        ], 2) : _vm._e(),
        _vm.type === 'unknown' ? _c('span', {
            staticClass: "hik-cloud-status-tag-span"
        }, [
            _c('img', {
                staticStyle: {
                    "margin-top": "-2px"
                },
                attrs: {
                    "src": img$d
                }
            }),
            _vm._t("default")
        ], 2) : _vm._e(),
        _vm.type === 'lock-nosupport' ? _c('span', {
            staticClass: "hik-cloud-status-tag-span"
        }, [
            _c('img', {
                staticStyle: {
                    "margin-top": "-2px"
                },
                attrs: {
                    "src": img$c
                }
            }),
            _vm._t("default")
        ], 2) : _vm._e(),
        _vm.type === 'cloud-nosupport' ? _c('span', {
            staticClass: "hik-cloud-status-tag-span"
        }, [
            _c('img', {
                attrs: {
                    "src": img$b
                }
            }),
            _vm._t("default")
        ], 2) : _vm._e(),
        _vm.type === 'overtime' ? _c('span', {
            staticClass: "hik-cloud-status-tag-span"
        }, [
            _c('img', {
                attrs: {
                    "src": img$a
                }
            }),
            _vm._t("default")
        ], 2) : _vm._e(),
        _vm.type === 'im-half-success' ? _c('span', {
            staticClass: "hik-cloud-status-tag-span"
        }, [
            _c('img', {
                attrs: {
                    "src": img$9
                }
            }),
            _vm._t("default")
        ], 2) : _vm._e(),
        _vm.type === 'ex-success' ? _c('span', {
            staticClass: "hik-cloud-status-tag-span"
        }, [
            _c('img', {
                attrs: {
                    "src": img$8
                }
            }),
            _vm._t("default")
        ], 2) : _vm._e(),
        _vm.type === 'ex-fail' ? _c('span', {
            staticClass: "hik-cloud-status-tag-span"
        }, [
            _c('img', {
                attrs: {
                    "src": img$7
                }
            }),
            _vm._t("default")
        ], 2) : _vm._e(),
        _vm.type === 'im-success' ? _c('span', {
            staticClass: "hik-cloud-status-tag-span"
        }, [
            _c('img', {
                attrs: {
                    "src": img$6
                }
            }),
            _vm._t("default")
        ], 2) : _vm._e(),
        _vm.type === 'ex-ing' ? _c('span', {
            staticClass: "hik-cloud-status-tag-span"
        }, [
            _c('img', {
                attrs: {
                    "src": img$5
                }
            }),
            _vm._t("default")
        ], 2) : _vm._e(),
        _vm.type === 'im-ing' ? _c('span', {
            staticClass: "hik-cloud-status-tag-span"
        }, [
            _c('img', {
                attrs: {
                    "src": img$4
                }
            }),
            _vm._t("default")
        ], 2) : _vm._e(),
        _vm.type === 'im-fail' ? _c('span', {
            staticClass: "hik-cloud-status-tag-span"
        }, [
            _c('img', {
                attrs: {
                    "src": img$3
                }
            }),
            _vm._t("default")
        ], 2) : _vm._e(),
        _vm.type === 'sms-check-fail' ? _c('span', {
            staticClass: "hik-cloud-status-tag-span"
        }, [
            _c('img', {
                attrs: {
                    "src": img$2
                }
            }),
            _vm._t("default")
        ], 2) : _vm._e(),
        _vm.type === 'sms-pending-check' ? _c('span', {
            staticClass: "hik-cloud-status-tag-span"
        }, [
            _c('img', {
                attrs: {
                    "src": img$1
                }
            }),
            _vm._t("default")
        ], 2) : _vm._e(),
        _vm.type === 'ispending' ? _c('span', {
            staticClass: "hik-cloud-status-tag-span"
        }, [
            _c('img', {
                attrs: {
                    "src": img
                }
            }),
            _vm._t("default")
        ], 2) : _vm._e(),
        !_vm.type && _vm.imgSrc ? _c('span', {
            staticClass: "hik-cloud-status-tag-span"
        }, [
            _c('img', {
                attrs: {
                    "src": _vm.imgSrc
                }
            }),
            _vm._t("default")
        ], 2) : _vm._e(),
        _vm.type === 'dot' ? _c('span', {
            staticClass: "hik-cloud-status-tag-span"
        }, [
            _c('div', {
                staticClass: "hik-cloud-status-tag-span-icon",
                style: {
                    'background-color': _vm.color
                }
            }),
            _vm._t("default")
        ], 2) : _vm._e()
    ]);
};
var __vue_staticRenderFns__ = [];
/* style */ const __vue_inject_styles__ = undefined;
/* style inject */ /* style inject SSR */ /* style inject shadow dom */ const __vue_component__ = /*#__PURE__*/ normalizeComponent({
    render: __vue_render__,
    staticRenderFns: __vue_staticRenderFns__
}, __vue_inject_styles__, __vue_script__);

/* istanbul ignore next */ __vue_component__.install = function(Vue) {
    // 安装国际化支持
    // 注册组件
    Vue.component(__vue_component__.name, __vue_component__);
};

export { __vue_component__ as default };
