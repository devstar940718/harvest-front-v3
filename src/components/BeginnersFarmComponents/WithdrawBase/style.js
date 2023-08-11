import styled from 'styled-components'
import Plus from '../../../assets/images/logos/beginners/plus.svg'
import Minus from '../../../assets/images/logos/beginners/minus.svg'

const BaseWido = styled.div`
  padding: 16px 24px 24px;
  ${props =>
    props.show
      ? `
  `
      : 'display: none;'}

  @media screen and (max-width: 992px) {
    padding: 12px 18px 18px;
  }
`

const NewLabel = styled.div`
  ${props =>
    props.weight
      ? `
    font-weight: ${props.weight};
  `
      : ''}
  ${props =>
    props.size
      ? `
    font-size: ${props.size};
  `
      : ''}
  ${props =>
    props.height
      ? `
    line-height: ${props.height};
  `
      : ''}
  ${props =>
    props.position
      ? `
    position: ${props.position};
  `
      : ''}
  ${props =>
    props.justifyContent
      ? `
    justify-content: ${props.justifyContent};
  `
      : ''}
  ${props =>
    props.marginTop
      ? `
    margin-top: ${props.marginTop};
  `
      : ''}
  ${props =>
    props.marginBottom
      ? `
    margin-bottom: ${props.marginBottom};
  `
      : ''}
  ${props =>
    props.display
      ? `
    display: ${props.display};
  `
      : ''}
  ${props =>
    props.items
      ? `
    align-items: ${props.items};
  `
      : ''}
  
  img.info-icon {
    margin-right: 12px;
    width: 20px;
    height: 20px;
  }

  @media screen and (max-width: 992px) {
    img.info-icon {
      margin-right: 5px;
      width: 14px;
      height: 14px;
    }
  }
`

const TokenInfo = styled.div`
  display: flex;
  justify-content: space-between;
`

const TokenSelect = styled.div`
  background: white;
  border: 1px solid #d0d5dd;
  box-shadow: 0px 1px 2px 0px rgba(16, 24, 40, 0.05);
  transition: 0.25s;

  border-radius: 8px;
  padding: 10px 14px;
  font-weight: 600;
  font-size: 14px;
  line-height: 24px;
  text-align: right;
  color: #344054;

  display: flex;
  align-items: center;

  img.logo {
    margin-right: 8px;
  }

  span {
    max-width: 150px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-right: 4px;
  }

  @media screen and (max-width: 992px) {
    font-size: 10px;
    line-height: 18px;
    padding: 7px 10px;

    img.logo {
      width: 16px;
      height: 16px;
      margin-right: 5px;
    }
  }
`

const TokenAmount = styled.input`
  font-weight: 700;
  font-size: 18px;
  line-height: 24px;
  width: 100%;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  background: #fff;
  border: 1px solid #d0d5dd;
  outline: 0;
  padding: 10px 14px;
  border-radius: 8px;
  color: #344054;
  transition: 0.25s;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    -moz-appearance: textfield;
    margin: 0;
  }

  @media screen and (max-width: 992px) {
    font-size: 10px;
    line-height: 18px;
    padding: 7px 10px;
  }
`

const Title = styled.div`
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  margin: 4px 0 20px;
  color: #475467;

  @media screen and (max-width: 992px) {
    font-size: 10px;
    line-height: 15px;
    margin: 0 0 15px;
  }
`

const AmountSection = styled.div`
  width: -webkit-fill-available;
  padding-right: 16px;
`

const BalanceInfo = styled.div`
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;

  margin-top: 5px;
  cursor: pointer;

  span {
    margin-left: 6px;
    color: #475467;
    transition: 0.25s;
  }

  @media screen and (max-width: 992px) {
    font-size: 10px;
    line-height: 18px;
    margin-top: 3px;
  }
`

const InsufficientSection = styled.div`
  border-radius: 12px;
  border: 1px solid #d0d5dd;
  background: #fcfcfd;
  padding: 16px;
  ${props =>
    props.isShow === 'true'
      ? `
    display: flex;
    justify-content: space-between;
  `
      : `
    display: none;
  `}
  margin-top: 20px;

  @media screen and (max-width: 992px) {
    padding: 10px;
    margin-top: 14px;
  }
`

const CloseBtn = styled.img`
  cursor: pointer;
  width: 20px;
  height: 20px;

  @media screen and (max-width: 992px) {
    width: 17px;
    height: 16px;
  }
`

const CreditCardBox = styled.div`
  border-radius: 10px;
  border: 1px solid var(--gray-200, #eaecf0);
  background: var(--base-white, #fff);
  box-shadow: 0px 1px 2px 0px rgba(16, 24, 40, 0.05);
  padding: 12px;

  @media screen and (max-width: 992px) {
    padding: 9px;

    img {
      width: 18px;
    }
  }
`

const ThemeMode = styled.div`
  display: flex;

  #theme-switch {
    position: relative;
    width: fit-content;
    height: fit-content;
    touch-action: pan-x;
    user-select: none;

    input {
      cursor: pointer;
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      opacity: 0;
    }

    .switch-track {
      background: #000;
      border: 1px solid ${props => props.borderColor};
      height: 24px;
      width: 50px;
      border-radius: 30px;
      transition: all 0.2s ease 0s;
    }
    .switch-thumb {
      background-size: cover;
      background-repeat: no-repeat;
      background-color: white;
      height: 20px;
      left: 2px;
      position: absolute;
      top: 2px;
      width: 20px;
      border-radius: 50%;
      transition: all 0.25s ease 0s;
    }

    &:hover .switch-thumb {
      box-shadow: 0 0 2px 3px #ff9400;
    }
  }

  ${props =>
    props.mode === 'deposit'
      ? `
      #theme-switch {
        .switch-check {
          opacity: 1;
        }
        .switch-x {
          opacity: 0;
        }
        .switch-thumb {
          left: 27px;
          background-image: url(${Plus});
        }
      }
    `
      : `
      #theme-switch {
        .switch-thumb {
          background-image: url(${Minus});
        }
      }
    `}

  @media screen and (max-width: 992px) {
    #theme-switch {
      .switch-track {
        width: 24px;
        height: 12px;
      }

      .switch-thumb {
        width: 10px;
        height: 10px;
        top: 1px;
      }
    }

    ${props =>
      props.mode === 'deposit'
        ? `
        #theme-switch {
          .switch-thumb {
            left: 12px;
          }
      `
        : `
        #theme-switch {
        .switch-thumb {
          left: 2px;
        }
      `}
`

export {
  BaseWido,
  NewLabel,
  TokenAmount,
  TokenInfo,
  TokenSelect,
  Title,
  AmountSection,
  BalanceInfo,
  InsufficientSection,
  CloseBtn,
  CreditCardBox,
  ThemeMode,
}