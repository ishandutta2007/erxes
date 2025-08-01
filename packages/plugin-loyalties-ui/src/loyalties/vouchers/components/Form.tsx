import SelectCompanies from "@erxes/ui-contacts/src/companies/containers/SelectCompanies";
import SelectCustomers from "@erxes/ui-contacts/src/customers/containers/SelectCustomers";
import SelectTags from "@erxes/ui-tags/src/containers/SelectTags";
import {
  Button,
  ControlLabel,
  Form,
  FormControl,
  FormGroup,
} from "@erxes/ui/src/components";
import {
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper,
} from "@erxes/ui/src/styles/eindex";
import SelectTeamMembers from "@erxes/ui/src/team/containers/SelectTeamMembers";
import { IButtonMutateProps, IFormProps } from "@erxes/ui/src/types";
import { isEnabled } from "@erxes/ui/src/utils/core";
import React from "react";
import SelectClientPortalUser from "../../../common/SelectClientPortalUsers";
import { queries as campaignQueries } from "../../../configs/voucherCampaign/graphql";
import { getOwnerTypes } from "../../common/constants";
import SelectCampaigns from "../../containers/SelectCampaigns";
import { IVoucher, IVoucherDoc } from "../types";

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  voucher: IVoucher;
  closeModal: () => void;
  queryParams: any;
};

type State = {
  tagIds: string[];
  voucher: IVoucher;
};

class VoucherForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { voucher = {} as IVoucher, queryParams } = this.props;

    if (!voucher.campaignId && queryParams && queryParams.campaignId) {
      voucher.campaignId = queryParams.campaignId;
    }

    if (!voucher.ownerType) {
      voucher.ownerType = "customer";
    }

    this.state = {
      tagIds: [],
      voucher,
    };
  }

  generateDoc = (values: { _id: string } & IVoucherDoc) => {
    const { voucher } = this.props;

    const finalValues = values;

    if (voucher) {
      finalValues._id = voucher._id;
    }

    return {
      _id: finalValues._id,
      tagIds: this.state.tagIds,
      ...this.state.voucher,
    };
  };

  onChangeInput = (e) => {
    const name = e.target.name;
    let value = e.target.value;
    if (e.target.type === "number") {
      value = Number(value);
    }

    this.setState({ voucher: { ...this.state.voucher, [name]: value } } as any);
  };

  renderFormGroup = (label, props) => {
    return (
      <FormGroup>
        <ControlLabel>{label}</ControlLabel>
        <FormControl {...props} onChange={this.onChangeInput} />
      </FormGroup>
    );
  };

  onChangeCampaign = (value) => {
    const { voucher } = this.state;
    this.setState({ voucher: { ...voucher, campaignId: value } });
  };

  onChangeSelect = (e) => {
    const { voucher } = this.state;
    const target = e.currentTarget as HTMLInputElement;
    const value = target.value;
    const name = target.name;

    this.setState({ voucher: { ...voucher, [name]: value } });
  };

  onChangeOwnerId = (ownerIds: string | string[]) => {
    const { voucher } = this.state;

    if (ownerIds && !Array.isArray(ownerIds)) {
      return this.setState({
        voucher: {
          ...voucher,
          ownerId: ownerIds,
        },
      });
    }

    this.setState({
      voucher: {
        ...voucher,
        ownerIds: (ownerIds || []) as string[], 
      },
    });
  };

  renderTag = () => {
    const { voucher, tagIds } = this.state;

    const { ownerType } = voucher;

    if (ownerType !== "customer" || this.props.voucher) {
      return null;
    }

    return (
      <FormGroup>
        <ControlLabel required={true}>Tag</ControlLabel>
        <SelectTags
          initialValue={tagIds}
          tagsType={`core:${ownerType}`}
          label="Tags"
          name="tagIds"
          multi={true}
          onSelect={(value) =>
            this.setState({ tagIds: Array.isArray(value) ? value : [value] })
          }
        />
      </FormGroup>
    );
  };

  renderOwner = () => {
    const { voucher } = this.state;

    const { ownerType } = voucher;

    const initialValue = this.props.voucher ? voucher.ownerId : voucher.ownerIds;

    switch (ownerType) {
      case "customer":
        return (
          <SelectCustomers
            label="Customer"
            name="ownerId"
            multi={!this.props.voucher}
            initialValue={initialValue}
            onSelect={this.onChangeOwnerId}
          />
        );
      case "user":
        return (
          <SelectTeamMembers
            label="Team member"
            name="ownerId"
            multi={!this.props.voucher}
            initialValue={initialValue}
            onSelect={this.onChangeOwnerId}
          />
        );
      case "company":
        return (
          <SelectCompanies
            label="Company"
            name="ownerId"
            multi={!this.props.voucher}
            initialValue={initialValue}
            onSelect={this.onChangeOwnerId}
          />
        );
      case "cpUser":
        return (
          isEnabled("clientportal") && (
            <SelectClientPortalUser
              label="Client portal User"
              name="ownerId"
              multi={!this.props.voucher}
              initialValue={initialValue}
              onSelect={this.onChangeOwnerId}
            />
          )
        );

      default:
        return null;
    }
  };

  renderContent = (formProps: IFormProps) => {
    const { voucher } = this.state;
    const { closeModal, renderButton } = this.props;
    const { values, isSubmitted } = formProps;

    return (
      <>
        <ScrollWrapper>
          <FormGroup>
            <ControlLabel>Campaign</ControlLabel>
            <SelectCampaigns
              queryName="voucherCampaigns"
              customQuery={campaignQueries.voucherCampaigns}
              label="Choose voucher campaign"
              name="campaignId"
              onSelect={this.onChangeCampaign}
              initialValue={voucher.campaignId}
              filterParams={
                voucher._id ? { equalTypeCampaignId: voucher.campaignId } : {}
              }
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Owner type</ControlLabel>
            <FormControl
              {...formProps}
              name="ownerType"
              componentclass="select"
              defaultValue={voucher.ownerType}
              required={true}
              onChange={this.onChangeSelect}
            >
              {getOwnerTypes().map((ownerType) => (
                <option key={ownerType.name} value={ownerType.name}>
                  {ownerType.label}
                </option>
              ))}
            </FormControl>
          </FormGroup>

          {this.renderTag()}

          <FormGroup>
            <ControlLabel required={true}>Owner</ControlLabel>
            {this.renderOwner()}
          </FormGroup>

          <FormGroup>
            <ControlLabel required={true}>Status</ControlLabel>
            <FormControl
              {...formProps}
              name="status"
              componentclass="select"
              defaultValue={voucher.status}
              required={true}
              onChange={this.onChangeSelect}
            >
              {["new", "status"].map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </FormControl>
          </FormGroup>
        </ScrollWrapper>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            Close
          </Button>

          {renderButton({
            name: "voucher",
            values: this.generateDoc(values),
            isSubmitted,
            object: this.props.voucher,
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default VoucherForm;
