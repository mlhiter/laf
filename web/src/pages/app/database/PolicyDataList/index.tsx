import { useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { AddIcon } from "@chakra-ui/icons";
import { Button, Select, Text } from "@chakra-ui/react";

import JsonEditor from "@/components/Editor/JsonEditor";
import Panel from "@/components/Panel";

import RightPanelEditBox from "../RightComponent/EditBox";
import RightPanelList from "../RightComponent/List";
import {
  useCollectionListQuery,
  useCreateRulesMutation,
  useDeleteRuleMutation,
  useRulesListQuery,
  useUpdateRulesMutation,
} from "../service";
import useDBMStore from "../store";

export default function PolicyDataList() {
  const collectionListQuery = useCollectionListQuery();
  const [currentData, setCurrentData] = useState<any>(undefined);
  const [record, setRecord] = useState("");
  const [collectionName, setCollectionName] = useState(collectionListQuery?.data?.data[0]?.name);

  const store = useDBMStore((state) => state);

  const rulesListQuery = useRulesListQuery((data: any) => {
    if (data?.data.length === 0) {
      setCurrentData({});
      setCollectionName(collectionListQuery?.data?.data[0]?.name);
    }
  });
  const deleteRuleMutation = useDeleteRuleMutation(() => {
    rulesListQuery.refetch();
  });
  const createRulesMutation = useCreateRulesMutation();
  const updateRulesMutation = useUpdateRulesMutation();

  const handleData = async () => {
    if (currentData?.id) {
      await updateRulesMutation.mutateAsync({ collection: collectionName, value: record });
    } else {
      await createRulesMutation.mutateAsync({ collectionName: collectionName, value: record });
    }
    rulesListQuery.refetch();
  };

  return (
    <>
      <Panel.Header className="w-full h-[55px] pr-2">
        <Button
          disabled={store.currentPolicy === undefined}
          colorScheme="primary"
          className="mr-2"
          style={{ width: "114px" }}
          leftIcon={<AddIcon />}
          onClick={() => {
            setCurrentData({});
            setCollectionName(collectionListQuery?.data?.data[0]?.name);
          }}
        >
          添加规则
        </Button>
        <span>规则数：{rulesListQuery?.data?.data?.length || 0}</span>
      </Panel.Header>
      <div className="w-full flex overflow-hidden" style={{ height: "calc(100vh - 130px)" }}>
        <RightPanelList
          ListQuery={rulesListQuery?.data?.data}
          setKey="id"
          isActive={(item: any) => currentData?.id === item.id}
          onClick={(data: any) => {
            setCurrentData(data);
          }}
          deleteRuleMutation={deleteRuleMutation}
          deleteData={(item) => ({ collection: item.collectionName })}
          component={(item: any) => {
            return (
              <>
                <div className="border-b-2 mb-4 p-2">
                  <Text fontSize="md" className="leading-loose font-semibold">
                    集合：{item.collectionName}
                  </Text>
                </div>
                <SyntaxHighlighter language="json" customStyle={{ background: "#fff" }}>
                  {JSON.stringify(item.value, null, 2)}
                </SyntaxHighlighter>
              </>
            );
          }}
        />
        <RightPanelEditBox
          title={currentData?.id ? "编辑" : "新增"}
          isLoading={
            currentData?.id ? updateRulesMutation.isLoading : createRulesMutation.isLoading
          }
          onSave={handleData}
        >
          <Text fontSize="md" className="leading-loose font-semibold mb-2">
            选择集合
          </Text>
          <Select
            variant="filled"
            isDisabled={currentData?.id}
            value={collectionName || ""}
            onChange={(e) => {
              setCollectionName(e.target.value);
            }}
          >
            {(collectionListQuery?.data?.data || []).map((item: any) => {
              return (
                <option key={item.name} value={item.name}>
                  {item.name}
                </option>
              );
            })}
          </Select>
          <Text fontSize="md" className="leading-loose font-semibold mt-4 mb-2">
            规则内容
          </Text>
          <div className=" flex-1">
            <JsonEditor
              value={JSON.stringify(currentData?.value || {}, null, 2)}
              onChange={(values) => {
                setRecord(values!);
              }}
            />
          </div>
        </RightPanelEditBox>
      </div>
    </>
  );
}