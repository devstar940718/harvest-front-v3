import styled from 'styled-components'

const NotificationMain = styled.div`
  margin: 9px 13px;
  background: linear-gradient(45deg, #ffac39 0%, #ffab36 100%);
  box-shadow: 0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03);
  border-radius: 12px;
  padding: 12px;

  display: flex;
  justify-content: space-between;

  .left-part {
    display: flex;
    width: 75%;

    img.main-img {
      margin-right: 16px;
    }

    .main-desc {
      align-self: center;
      font-weight: 600;
      font-size: 16px;
      line-height: 24px;
      color: white;
    }
  }

  .right-part {
    display: flex;

    .announcement {
      font-weight: 600;
      font-size: 16px;
      line-height: 24px;
      color: #ff9400;
      background: #f9f5ff;
      padding: 10px 18px;

      border: 1px solid #f9f5ff;
      border-radius: 8px;
    }

    .close {
      cursor: pointer;
      margin-left: 15px;
      margin-right: 15px;
      align-self: center;

      width: 20px;
    }
  }

  @media screen and (max-width: 992px) {
    margin: 5px;
    .left-part {
      img.main-img {
        margin-right: 7px;
      }

      .main-desc {
        font-weight: 600;
        font-size: 10px;
        line-height: 14px;
      }
    }

    .right-part {
      .announcement {
        font-size: 10px;
        line-height: 14px;
      }
      .close {
        width: 10px;
        margin-left: 10px;
        margin-right: 10px;
      }
    }
  }
`

const Icon = styled.img`
  filter: invert(100%) sepia(2%) saturate(66%) hue-rotate(51deg) brightness(113%) contrast(100%);
`

export { NotificationMain, Icon }
